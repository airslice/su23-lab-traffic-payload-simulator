/* eslint-disable @typescript-eslint/no-explicit-any */
import p5 from "p5";
import { useRef, useEffect } from "react";
import PF from "pathfinding";

type position = {
  x: number;
  y: number;
};

const sketch = (p: any) => {
  const debugAmount = 0; // 0 for no debug
  // simulation
  const simulateFlow: "enter" | "exit" | "mix" = "mix";
  const openedEntranceIds = [4];
  const openedExitIds = [3];

  const payloadMapEnter: number[] = [];
  const payloadMapExit: number[] = [];
  const offset = 3;

  // map
  const roadmap = {
    w: 1000,
    h: 1072,
  };
  let roadMap: any;
  let refMap: any;
  const max = 1795;

  const hardcodeEntranceIdsFromX = {
    839: 1, // 18#
    101: 2, // 7#
    465: 3, // 9#
    263: 4, // 4#
  };
  const entrances: (position & { id: number })[] = [];
  const roads: position[] = [];
  const parkings: position[] = [];

  const finder = new PF.AStarFinder();

  const findPath = (
    starts: position[],
    ends: position[],
    grid: PF.Grid,
    finder: PF.AStarFinder
  ) => {
    const paths: number[][][] = [];
    starts.forEach((start) => {
      ends.forEach((end) => {
        const path = finder.findPath(
          start.x,
          start.y,
          end.x,
          end.y,
          grid.clone()
        );
        paths.push(path);
      });
    });
    let bestPath = paths[0];
    if (paths.length > 1) {
      bestPath = paths.reduce((prev, curr) => {
        if (curr.length < prev.length) {
          return curr;
        }
        return prev;
      });
    }
    return bestPath;
  };

  const simulateOneParking = async (
    mode: "enter" | "exit",
    entrances: (position & { id: number })[],
    parking: position,
    openedEntranceIds: number[],
    openedExitIds: number[],
    grid: PF.Grid,
    finder: PF.AStarFinder,
    payloadMap: number[]
  ) => {
    return new Promise((resolve) => {
      let path;
      let tempColor;
      if (mode === "enter") {
        path = findPath(
          entrances.filter((e) => openedEntranceIds.includes(e.id)),
          [parking],
          grid,
          finder
        );
        tempColor = [255, 0, 0, 1];
      } else {
        path = findPath(
          [parking],
          entrances.filter((e) => openedExitIds.includes(e.id)),
          grid,
          finder
        );
        tempColor = [0, 0, 255, 1];
      }

      // add to payload
      if (path) {
        let lastDir;
        const corners = [];

        // go through path
        for (let i = 1; i < path.length; i += 1) {
          const pathPoint = path[i];

          // consider direction
          let curDir;
          const last = i > 0 ? path[i - 1] : path[i];
          if (pathPoint[0] === last[0] && pathPoint[1] === last[1] + 1) {
            // go down, offset x-
            payloadMap[pathPoint[1] * roadmap.w + pathPoint[0] - offset] += 1;
            curDir = "down";
          } else if (pathPoint[0] === last[0] && pathPoint[1] === last[1] - 1) {
            // go up, offset x+
            payloadMap[pathPoint[1] * roadmap.w + pathPoint[0] + offset] += 1;
            curDir = "up";
          } else if (pathPoint[1] === last[1] && pathPoint[0] === last[0] - 1) {
            // go left, offset y-
            payloadMap[(pathPoint[1] - offset) * roadmap.w + pathPoint[0]] += 1;
            curDir = "left";
          } else if (pathPoint[1] === last[1] && pathPoint[0] === last[0] + 1) {
            // go right, offset y+
            payloadMap[(pathPoint[1] + offset) * roadmap.w + pathPoint[0]] += 1;
            curDir = "right";
          } else {
            payloadMap[pathPoint[1] * roadmap.w + pathPoint[0]] += 1;
          }

          // record corner
          if (lastDir && lastDir !== curDir) {
            corners.push({
              x: last[0],
              y: last[1],
              from: lastDir,
              to: curDir,
            });
          }
          lastDir = curDir;
          // temp render
          p.fill(...tempColor);
          p.circle(pathPoint[0], pathPoint[1], 4);
        }

        // fix corner
        corners.forEach((corner) => {
          if (corner.from === "up" && corner.to === "left") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[
                (corner.y - i - 1) * roadmap.w + corner.x + offset
              ] += 1;
              payloadMap[(corner.y - offset) * roadmap.w + corner.x + i] += 1;
            }
          } else if (corner.from === "up" && corner.to === "right") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[(corner.y + i) * roadmap.w + corner.x + offset] -= 1;
              payloadMap[
                (corner.y + offset) * roadmap.w + corner.x + i + 1
              ] -= 1;
            }
          } else if (corner.from === "down" && corner.to === "left") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[(corner.y - i) * roadmap.w + corner.x - offset] -= 1;
              payloadMap[
                (corner.y - offset) * roadmap.w + corner.x - i - 1
              ] -= 1;
            }
          } else if (corner.from === "down" && corner.to === "right") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[
                (corner.y + i + 1) * roadmap.w + corner.x - offset
              ] += 1;
              payloadMap[(corner.y + offset) * roadmap.w + corner.x - i] += 1;
            }
          } else if (corner.from === "left" && corner.to === "up") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[
                (corner.y - i - 1) * roadmap.w + corner.x + offset
              ] -= 1;
              payloadMap[(corner.y - offset) * roadmap.w + corner.x + i] -= 1;
            }
          } else if (corner.from === "left" && corner.to === "down") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[(corner.y - i) * roadmap.w + corner.x - offset] += 1;
              payloadMap[
                (corner.y - offset) * roadmap.w + corner.x - i - 1
              ] += 1;
            }
          } else if (corner.from === "right" && corner.to === "up") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[(corner.y + i) * roadmap.w + corner.x + offset] += 1;
              payloadMap[
                (corner.y + offset) * roadmap.w + corner.x + i + 1
              ] += 1;
            }
          } else if (corner.from === "right" && corner.to === "down") {
            for (let i = 0; i < offset; i += 1) {
              payloadMap[
                (corner.y + i + 1) * roadmap.w + corner.x - offset
              ] -= 1;
              payloadMap[(corner.y + offset) * roadmap.w + corner.x - i] -= 1;
            }
          }
        });
      }

      setTimeout(() => {
        resolve(path.length);
      }, 0);
    });
  };

  const simulate = async (
    mode: "enter" | "exit",
    entrances: (position & { id: number })[],
    parkings: position[],
    openedEntranceIds: number[],
    openedExitIds: number[],
    grid: PF.Grid,
    finder: PF.AStarFinder,
    payloadMap: number[]
  ) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      for (
        let pindex = 0;
        pindex < (debugAmount ? debugAmount : parkings.length);
        pindex += 1
      ) {
        const pathLength = await simulateOneParking(
          mode,
          entrances,
          parkings[pindex],
          openedEntranceIds,
          openedExitIds,
          grid,
          finder,
          payloadMap
        );
        console.log(`simulate ${mode}`, pindex, pathLength);
        if (mode === "enter") {
          p.fill(255, 0, 0, 255);
        } else {
          p.fill(0, 0, 255, 255);
        }
        p.circle(parkings[pindex].x, parkings[pindex].y, 4);
      }
      resolve(true);
    });
  };

  p.preload = () => {
    roadMap = p.loadImage("/roadmap1000.png");
    refMap = p.loadImage("/reference.png");
  };

  p.setup = async () => {
    p.createCanvas(roadmap.w, roadmap.h);
    p.background(255);
    p.noStroke();
    p.image(roadMap, 0, 0);
    p.loadPixels();

    // load data
    for (let i = 0; i < p.pixels.length; i += 4) {
      // clear payload
      payloadMapEnter[i / 4] = 0;
      payloadMapExit[i / 4] = 0;

      // find entrances
      if (
        p.pixels[i] === 0 &&
        p.pixels[i + 1] === 255 &&
        p.pixels[i + 2] === 0 &&
        p.pixels[i + 3] === 255
      ) {
        const x = (i / 4) % roadmap.w;
        const y = Math.floor(i / 4 / roadmap.w);
        entrances.push({
          x,
          y,
          id: hardcodeEntranceIdsFromX[
            x as keyof typeof hardcodeEntranceIdsFromX
          ],
        });
      }

      // find roads
      else if (
        p.pixels[i] === 255 &&
        p.pixels[i + 1] === 0 &&
        p.pixels[i + 2] === 0 &&
        p.pixels[i + 3] === 255
      ) {
        roads.push({
          x: (i / 4) % roadmap.w,
          y: Math.floor(i / 4 / roadmap.w),
        });
      }

      // find parkings
      else if (
        p.pixels[i] === 0 &&
        p.pixels[i + 1] === 0 &&
        p.pixels[i + 2] === 255 &&
        p.pixels[i + 3] === 255
      ) {
        parkings.push({
          x: (i / 4) % roadmap.w,
          y: Math.floor(i / 4 / roadmap.w),
        });
      }
    }

    // draw sketch
    // roads
    p.fill(50, 50, 50);
    for (let i = 0; i < roads.length; i++) {
      p.circle(roads[i].x, roads[i].y, 3);
    }

    // parkings
    console.log("parkings", parkings);
    p.fill(255, 255, 0, 255);
    for (let i = 0; i < parkings.length; i++) {
      if (debugAmount > 0 && i === debugAmount) {
        p.fill(200, 200, 200, 255);
      }
      p.circle(parkings[i].x, parkings[i].y, 4);
    }

    // entrances
    console.log("entrances", entrances);
    p.fill(0, 255, 0);
    for (let i = 0; i < entrances.length; i++) {
      p.circle(entrances[i].x, entrances[i].y, 10);
    }

    // set grid
    const grid = new PF.Grid(roadmap.w, roadmap.h);
    for (let i = 0; i < p.pixels.length; i += 4) {
      const x = (i / 4) % roadmap.w;
      const y = Math.floor(i / 4 / roadmap.w);
      grid.setWalkableAt(
        x,
        y,
        !(
          p.pixels[i] === 0 &&
          p.pixels[i + 1] === 0 &&
          p.pixels[i + 2] === 0 &&
          p.pixels[i + 3] === 255
        )
      );
    }

    // simulate enter
    if (simulateFlow !== "exit") {
      await simulate(
        "enter",
        entrances,
        parkings,
        openedEntranceIds,
        openedExitIds,
        grid,
        finder,
        payloadMapEnter
      );
    }

    // simulate exit
    if (simulateFlow !== "enter") {
      await simulate(
        "exit",
        entrances,
        parkings,
        openedEntranceIds,
        openedExitIds,
        grid,
        finder,
        payloadMapExit
      );
    }

    // output
    output();
  };

  const output = () => {
    // 2x
    p.resizeCanvas(roadmap.w * 2, roadmap.h * 2);

    // base ref map
    p.image(refMap, 0, 0, roadmap.w * 2, roadmap.h * 2);
    // p.background(0, 0, 0);

    // roads
    // p.fill(100, 100, 100);
    // for (let i = 0; i < roads.length; i++) {
    //   p.circle(roads[i].x * 2, roads[i].y * 2, 4);
    // }

    // payload
    p.colorMode(p.HSL, 360, 100, 100, 1);

    if (simulateFlow === "enter") {
      payloadMapEnter.forEach((value, index) => {
        if (value > 1) {
          const x = (index % roadmap.w) * 2;
          const y = Math.floor(index / roadmap.w) * 2;
          // p.fill(100 - (value / max) * 100, 100, 50);
          p.fill(100 - (value / max) * 100, 100, 50);
          // p.fill(255, 0, 0, (value / max) * 155 + 100);
          p.circle(x, y, (value / max) * 10 + 4);
        }
      });
    } else if (simulateFlow === "exit") {
      payloadMapExit.forEach((value, index) => {
        if (value > 1) {
          const x = (index % roadmap.w) * 2;
          const y = Math.floor(index / roadmap.w) * 2;
          // p.fill(100 - (value / max) * 100, 100, 50);
          p.fill(122 + (value / max) * 100, 100, 50);
          // p.fill(0, 0, 255, (value / max) * 155 + 100);
          p.circle(x, y, (value / max) * 10 + 4);
        }
      });
    } else {
      payloadMapEnter.forEach((value, index) => {
        const mixValue = value + payloadMapExit[index];
        if (mixValue > 1) {
          const x = (index % roadmap.w) * 2;
          const y = Math.floor(index / roadmap.w) * 2;
          // p.fill(100 - (value / max) * 100, 100, 50);
          p.fill(100 - (mixValue / max) * 100, 100, 50);
          // p.fill(255, 0, 0, (value / max) * 155 + 100);
          p.circle(x, y, (mixValue / max) * 10 + 4);
        }
      });
    }

    // entrances
    p.stroke(0, 0, 0);
    p.strokeWeight(3);
    const arrowRight = [-10, -8, -10, 8, 10, 0];
    const arrowLeft = [10, -8, 10, 8, -10, 0];
    entrances
      .filter((entrance) => openedEntranceIds.includes(entrance.id))
      .forEach((entrance) => {
        p.fill(0, 100, 50);

        const a = entrance.id === 2 ? arrowLeft : arrowRight;
        const offset = entrance.id === 2 ? -4 : 4;
        p.triangle(
          entrance.x * 2 + a[0],
          (entrance.y + offset) * 2 + a[1],
          entrance.x * 2 + a[2],
          (entrance.y + offset) * 2 + a[3],
          entrance.x * 2 + a[4],
          (entrance.y + offset) * 2 + a[5]
        );
      });

    entrances
      .filter((entrance) => openedExitIds.includes(entrance.id))
      .forEach((entrance) => {
        p.fill(200, 100, 50);

        const a = entrance.id === 2 ? arrowRight : arrowLeft;
        const offset = entrance.id === 2 ? 4 : -4;
        p.triangle(
          entrance.x * 2 + a[0],
          (entrance.y + offset) * 2 + a[1],
          entrance.x * 2 + a[2],
          (entrance.y + offset) * 2 + a[3],
          entrance.x * 2 + a[4],
          (entrance.y + offset) * 2 + a[5]
        );
      });

    // text
    p.fill(0, 100, 100);
    p.textSize(28);
    p.text("道路负载模拟", 51, 1826);

    p.fill(0, 100, 100, 0.7);
    p.textSize(22);
    const intro = `
    模拟条件:
    - 计算所有停车位。
    - 仅考虑地下路线，允许双向通行。
    - 基于A*算法寻路。
    - 未考虑驾驶便捷因素。
      (例如下4号坡道连续右转难度过大)`;
    p.text(intro, 51, 1826, 460, 297);

    p.fill(0, 100, 100);
    p.textSize(28);
    p.text("仅供参考", 51, 2070);

    p.fill(0, 100, 100);
    p.textSize(28);
    p.text("出入口配置", 1481, 1826);

    const entranceIntro: { [key: number]: string } = {
      1: "1# [北区,和硕路,东门]",
      2: "2# [北区,树屏路,北门]",
      3: "3# [南区,盘安路,西门]",
      4: "4# [南区,盘安路,西门]",
    };

    p.textSize(24);
    for (let i = 0; i < 4; i++) {
      const configText = getConfigText(i + 1);
      if (configText === "关闭") {
        p.fill(0, 100, 100, 0.5);
      } else {
        p.fill(0, 100, 100);
      }
      p.text(`${entranceIntro[i + 1]}: ${configText}`, 1481, 1875 + i * 36);
    }
  };

  const getConfigText = (id: number) => {
    if (openedEntranceIds.includes(id) && openedExitIds.includes(id)) {
      return "双向进出";
    } else if (openedEntranceIds.includes(id)) {
      return "单进";
    } else if (openedExitIds.includes(id)) {
      return "单出";
    } else {
      return "关闭";
    }
  };
};

const Simulator: React.FC = () => {
  const p5ContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // On component creation, instantiate a p5 object with the sketch and container reference
    const p5Instance =
      p5ContainerRef.current !== null
        ? new p5(sketch, p5ContainerRef.current)
        : null;

    // On component destruction, delete the p5 instance
    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);
  return <div ref={p5ContainerRef} />;
};

export default Simulator;
