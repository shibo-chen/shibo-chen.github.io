# 陈士博

资深架构师 \| Chiplet NoC、coherent fabric、内存子系统、性能建模与 AI 辅助硬件设计

<div id="webaddress">Santa Clara, CA</div>
<div id="webaddress">
<a href="mailto:chshibo@outlook.com">chshibo@outlook.com</a>
| <a href="https://shibo-chen.github.io/">https://shibo-chen.github.io/</a>
| <a href="https://www.linkedin.com/in/shibo-chen-1314741b4/">LinkedIn</a>
| <a href="https://github.com/shibo-chen">GitHub</a>
</div>

## 简介

- Tenstorrent 资深架构师，工作横跨 chiplet AI/ML 加速器和 RISC-V CPU SoC。
- 专长覆盖 non-coherent 与 coherent（CHI）NoC、D2D 互连、AXI/PCIe fabric，以及 GDDR/LPDDR 内存子系统，用和 RTL 校准过的性能模型支撑架构决策。
- 擅长通过清晰的模型和跨团队 debug 闭环推动架构落地，聚焦吞吐、时延、利用率、功耗与面积等关键指标。
- 开发 fabric 生成器、可执行 spec 和形式验证检查，把架构直接落到经过验证的 RTL。

## 核心技能

- AI 加速器架构：Chiplet AI/ML 加速器系统、系统级权衡分析、性能目标收敛
- NoC 与互连：non-coherent 与 coherent（CHI）NoC、封装内 D2D、routing、QoS、topology、clocking、可观测性、RAS/debuggability
- 标准与 Fabric：AXI、CHI、PCIe、cache/fabric 集成、异构 SoC 连接
- 内存系统：GDDR/LPDDR/DDR 控制器、内存通道规划、地址交织、带宽分析、瓶颈消除
- 分析与建模：和 RTL 校准的性能模型、cycle-accurate 模拟器、工作负载表征、时延/带宽/利用率分析
- 设计自动化与验证：fabric RTL 生成器、可执行 spec、形式验证、AI 辅助 RTL
- 推进与落地：架构规格、设计评审、RTL/PD/验证/软件联合调试、跨团队技术推动

## 经历

`2026年10月 - 至今`  
**Tenstorrent, Santa Clara, CA**

*资深架构师*

- 牵头自研 coherent fabric（CHI）：transport、chip-to-chip 互连和 SoC 集成。
- 牵头 AI 辅助硬件设计：用可执行 spec 直接生成 golden model、RTL 和形式验证检查。
- 把握 AI NoC 和 CPU coherent fabric 两条线的性能建模方向。
- 带架构师和实习生，打通建模、RTL、验证几个团队的协作。

`2025年5月 - 2026年10月`  
**Tenstorrent, Santa Clara, CA**

*高级架构师*

- Chiplet NoC spec：负责 IO chiplet 和 LPDDR chiplet 的 non-coherent NoC spec，包括拓扑、地址映射、交织粒度、KPI 和 LPDDR 控制器位宽。
- NoC RTL 与 debug：在 IO chiplet fabric 上集成 trace、remap 和 timeout 功能；定位 head-of-line blocking，把带宽拉到目标。
- GDDR chiplet：推动 bring-up、性能分析和 debug，包括带宽校准、非对齐访问优化，以及 telemetry 和 timeout 验证。
- 第三方 IP：主持商用 NoC 和内存 IP 的设计评审与评估，把厂商模型接入内部仿真。
- 性能建模：覆盖 CPU 多核扩展和 SLC 策略、AI 加速器模型的 RTL 校准，以及 cycle-accurate NoC 模拟器。
- Fabric 生成器：开发 AXI fabric 生成器（已被 SoC 团队采用），以及自研 CHI fabric 的生成器和形式验证环境。
- RISC-V ACLINT：从可执行 spec 生成 RTL，并和 golden model 做形式验证比对。
- 招聘与校企合作：搭建面试框架、参与面试，支持高校研究合作。

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

`2023`  
**Security Verification of Low-Trust Architectures**

- CCS 2023，Distinguished Paper Award

`2022`  
**Twine: A Chisel Extension for Component-Level Heterogeneous Design**

- DATE 2022
- 提出面向异构系统组件级组合的硬件设计方法。

## 学术服务

- ICCD 2025（IEEE International Conference on Computer Design）程序委员会委员
- CAMS 2025（Workshop on Computer Architecture Modeling and Simulation）程序委员会委员

最近更新：2026年10月
