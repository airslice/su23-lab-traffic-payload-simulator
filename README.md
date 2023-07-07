# su23-lab-traffic-payload-simulator
A simple traffic payload simulator for 金地峯范地下停车场 (shanghai)

## Overview

这是一个用于上海金地峯范小区地下停车场的简单交通负载模拟程序，用于模拟在开放不同地库出入口的情况下各条道路的负载情况。
模拟基于以下条件：
- 计算所有停车位，子母车位算两个；
- 仅考虑地下道路，地库出入口至小区出入口的地面道路未参与计算；
- 基于A*算法计算每个车位与最近的可用出入口；
- 未考虑实际驾驶便捷性因素，典型的例如下4号坡道后连续右转难度过大实际很难操作；

## Notice
- 本模拟主要针对道路使用率，对于出入口双向汇车的额外风险可能表现不足（双向橙色负载交通事故发生率将显著高于单向红色负载），考虑到坡道转弯及坡道宽度务必引起重视；
- 模拟结果可视化中偶见双向道路中短划线可以忽略（来自于右侧行驶偏移后进出车位路线的偶发重合，属于正常现象）；
- 本模拟未打算构建为在线应用，不包含UI/UX，仅用于生成可视化模拟结果；
- 出入口以坡道编号为准，对应关系为：
  - 1 [北区,和硕路,东门] 近18# 19#楼，东门主出入口
  - 2 [北区,树屏路,北门] 近7#楼，北门暂无开放日期
  - 3 [南区,盘安路,西门] 近9#楼
  - 4 [南区,盘安路,西门] 近4#楼，西门主出入口

## Simulation Result

### 4进3出 （南区单入单出，4#进9#出）

![4-3](https://github.com/airslice/su23-lab-traffic-payload-simulator/assets/21994748/f810e7cf-22bd-4802-af97-e74248de3483)

### 4双1双（南区4#双向，北区东门双向）

![14-14](https://github.com/airslice/su23-lab-traffic-payload-simulator/assets/21994748/e1b6963d-6b01-4a37-95af-9c5203f74d71)

### 4进3出1双（南区单入单出，北区东门双向）

![14-13](https://github.com/airslice/su23-lab-traffic-payload-simulator/assets/21994748/f07f2d9c-fff2-4ec6-9f0e-1a495c83bbd1)
