# 陈士博

资深架构师 | Chiplet AI 加速器系统、NoC 与 D2D 互连、内存子系统架构

Santa Clara, CA  
[chshibo@outlook.com](mailto:chshibo@outlook.com) | [https://shibo-chen.github.io/](https://shibo-chen.github.io/) | [LinkedIn](https://www.linkedin.com/in/shibo-chen-1314741b4/) | [GitHub](https://github.com/shibo-chen)

## 简介

- Tenstorrent 资深架构师，专注于 Chiplet AI/ML 加速器系统、可扩展片上与片间互连，以及内存子系统架构。
- 专长覆盖 NoC 与 D2D 架构、非一致性互连、AXI/CHI/PCIe fabric，以及 LPDDR/DDR 内存子系统；在需要时使用性能分析辅助架构决策。
- 擅长通过清晰的模型和跨团队 debug 闭环推动架构落地，聚焦吞吐、时延、利用率、功耗与面积等关键指标。

## 核心技能

- AI 加速器架构：Chiplet AI/ML 加速器系统、系统级权衡分析、性能目标收敛
- NoC 与互连：非一致性 NoC、封装内 D2D、routing、QoS、topology、clocking、可观测性、RAS/debuggability
- 标准与 Fabric：AXI、CHI、PCIe、cache/fabric 集成、异构 SoC 连接
- 内存系统：LPDDR/DDR 控制器、内存通道规划、地址交织、带宽分析、瓶颈消除
- 分析与建模：性能模型、模拟器、工作负载表征、时延/带宽/利用率分析
- 推进与落地：架构规格、设计评审、RTL/PD/验证/软件联合调试、跨团队技术推动

## 经历

`2026年10月 - 至今`  
**Tenstorrent, Santa Clara, CA**

*资深架构师*

- 主导 Chiplet AI/ML 加速器的 NoC 架构方向，从权衡研究到架构决策。
- 推动可执行规格方法论：以代码编写规格，生成参考模型、RTL 与形式化检查。
- 指导架构师与实习生；协调建模、RTL 与验证团队。

`2025年5月 - 2026年10月`  
**Tenstorrent, Santa Clara, CA**

*高级架构师*

- 负责 Chiplet SoC 的 NoC 规格：地址交织、遥测、电源域，并与第三方 IP 对齐。
- 搭建 cycle-accurate NoC 模型，并与 RTL 和 AI 工作负载对齐。
- 建模 D2D 通路与内存子系统（LLC 策略、LPDDR 带宽）。
- 开发互连 RTL 生成器；规格评审发现数十个 CHI 协议 bug。
- 主导 NoC、D2D、AXI/CHI/PCIe 与 LPDDR/DDR 架构评审。

`2023年5月 - 2023年8月`  
**Tenstorrent, Santa Clara, CA**

*平台架构实习生*

- 研究多核、多 chiplet fabric 架构调整，平衡性能效率与功耗目标。
- 评估片上与片外流量，用于功耗分析与早期系统规划。
- 制定异构集成场景下的 cache 与 fabric 验证测试计划。
- 搭建多核、多 chiplet 流量生成、测试与仿真流程。
- 配置 Arteris IP 以支持非一致性流量，并覆盖关键 fabric 集成边界场景。

`2022年5月 - 2022年8月`  
**Tenstorrent, Santa Clara, CA**

*平台架构实习生*

- 参与服务器级 RISC-V 多核 CPU 的架构研究。
- 开发面向异构多核系统的可配置 fabric 性能模型。
- 设计配置语义以覆盖核心、缓存、内存与互连的多种组合方案。

## 教育背景

`2019 - 2025`  
**University of Michigan, Ann Arbor, MI**

- 计算机科学与工程博士
- 论文：*Streamlining High-Performance Heterogeneous Hardware Design*

`2022 - 2025`  
**University of Michigan, Ann Arbor, MI**

- 创新与创业研究生证书

`2016 - 2019`  
**University of Michigan, Ann Arbor, MI**

- 计算机科学学士（高荣誉）

## 代表论文

`2025`  
**Zipper: Latency-Tolerant Optimizations for High-Performance Buses**

- ASP-DAC 2025
- 在一类加速器上实现最高 8x 加速，逻辑开销 4.3%；在另一类加速器上实现 1.5x 加速，逻辑开销 0.9%。

`2022`  
**Twine: A Chisel Extension for Component-Level Heterogeneous Design**

- DATE 2022
- 提出面向异构系统组件级组合的硬件设计方法。

`2023`  
**Security Verification of Low-Trust Architectures**

- CCS 2023，Distinguished Paper Award

最近更新：2026年3月
