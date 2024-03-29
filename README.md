# su23-lab-traffic-payload-simulator
A simple traffic payload simulator for 金地峯范地下停车场 (shanghai)

## Overview

这是一个用于上海金地峯范小区地下停车场的简单交通负载模拟程序，用于模拟在开放不同地库出入口的情况下各条道路的负载情况。
模拟基于以下条件：
- 计算所有停车位，子母车位算两个；
- 仅考虑地下道路，地库出入口至小区出入口的地面道路未参与计算；
- 行车路线基于A*算法计算每个车位与最近的可用出入口；
- 未考虑出行需求因素，比如人为需求从指定出入口进出；
- 未考虑实际驾驶便捷性因素，典型的例如下4号坡道后连续右转难度过大实际很难操作；

## Important
- 请特别注意双向汇车的额外风险，考虑到坡道弯道、出入口弯道双向通行将显著降低通行效率及行车安全性；
- 本模拟仅呈现基于模拟条件的道路负载，无法体现通行效率及通行安全度，切勿片面解读；
- 综合考量模拟条件及未考虑因素，模拟结果与实际情况可能存在**较大差异**，因此不在社区公开，仅作为项目存档；
- **模拟结果仅供参考！模拟结果仅供参考！模拟结果仅供参考！**

## Notice
- 模拟结果可视化中偶见双向道路中短划线可以忽略（来自于右侧行驶偏移后进出车位路线的偶发重合，属于正常现象）；
- 本模拟未打算构建为在线应用，不包含UI/UX，仅用于生成可视化模拟结果；
- 出入口以坡道编号为准，对应关系为：
  - 1 [北区,和硕路,东门] 近18# 19#楼，东门主出入口
  - 2 [北区,树屏路,北门] 近7#楼，北门暂无开放日期
  - 3 [南区,盘安路,西门] 近9#楼
  - 4 [南区,盘安路,西门] 近4#楼，西门主出入口

## Simulation Result

## 东门开放前

### 4双3双 （无特殊管制，南区4# 9#双向进出，当前状态）

![34-34](https://github.com/airslice/su23-lab-traffic-payload-simulator/assets/21994748/5fec60d6-e0c1-4d41-8590-f5bfdab31800)

### 4进3出 （南区单入单出，4#进9#出，前期公示方案一）

![4-3](https://github.com/airslice/su23-lab-traffic-payload-simulator/assets/21994748/f810e7cf-22bd-4802-af97-e74248de3483)

## 东门开放后

### 4双1双（南区4#双向，北区东门双向，前期公示方案二）

![14-14](https://github.com/airslice/su23-lab-traffic-payload-simulator/assets/21994748/e1b6963d-6b01-4a37-95af-9c5203f74d71)

### 4进3出1双（南区单入单出，沿用方案一，北区东门双向）

![14-13](https://github.com/airslice/su23-lab-traffic-payload-simulator/assets/21994748/f07f2d9c-fff2-4ec6-9f0e-1a495c83bbd1)

## 北门开放遥遥无期，暂跳过模拟
