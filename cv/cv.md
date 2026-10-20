# Shibo Chen

Staff Architect | Chiplet-based AI accelerators, NoC and D2D interconnects, and memory-system architecture

Santa Clara, CA  
[chshibo@outlook.com](mailto:chshibo@outlook.com) | [https://shibo-chen.github.io/](https://shibo-chen.github.io/) | [LinkedIn](https://www.linkedin.com/in/shibo-chen-1314741b4/) | [GitHub](https://github.com/shibo-chen)

## Summary

- Staff Architect at Tenstorrent focused on chiplet-based AI/ML accelerator systems, scalable fabrics, and memory-system architecture.
- Expertise in NoC and D2D architecture, non-coherent interconnects, AXI/CHI/PCIe fabrics, and LPDDR/DDR memory systems, with selective use of performance modeling to drive decisions.
- Known for driving architecture decisions with clear models, tight cross-functional debug loops, and measurable focus on throughput, latency, utilization, power, and area.

## Core Skills

- AI Accelerator Architecture: chiplet-based AI/ML accelerator systems, system tradeoff analysis, performance target closure
- NoC and Interconnects: non-coherent NoC, on-package D2D, routing, QoS, topology, clocking, observability, RAS/debuggability
- Standards and Fabrics: AXI, CHI, PCIe, cache and fabric integration, heterogeneous SoC connectivity
- Memory Systems: LPDDR/DDR controllers, memory-channel sizing, interleaving, bandwidth analysis, bottleneck removal
- Modeling and Analysis: performance models, simulators, workload characterization, latency/bandwidth/utilization studies
- Execution: architecture specifications, design reviews, RTL/PD/verification/software debug, cross-team technical leadership

## Experience

`Oct 2026 - Present`  
**Tenstorrent, Santa Clara, CA**

*Staff Architect*

- Lead the in-house coherent fabric (CHI): transport, chip-to-chip links, and SoC integration.
- Lead AI-assisted hardware design: executable specs that generate golden models, RTL, and formal checks.
- Set performance-modeling direction across the AI NoC and the coherent CPU fabric.
- Mentor architects and interns; align modeling, RTL, and verification teams.

`May 2025 - Oct 2026`  
**Tenstorrent, Santa Clara, CA**

*Senior Architect*

- Chiplet NoC specs: owned non-coherent NoC specs for IO and LPDDR chiplets (topology, address maps, interleaving, KPIs).
- NoC RTL and debug: integrated trace, remap, and timeout features in an IO-chiplet fabric; fixed head-of-line blocking to meet bandwidth targets.
- Memory systems: drove GDDR chiplet bring-up and bandwidth studies; sized LPDDR controllers and interleaving.
- Third-party IP: ran design reviews and evaluations of commercial NoC and memory IP; wrapped vendor models for in-house simulation.
- Performance modeling: CPU multicore scaling and SLC policies, AI-accelerator models correlated with RTL, and a cycle-accurate NoC simulator.
- Fabric generators: built an AXI fabric generator adopted by SoC teams, and the in-house CHI fabric's generator and formal environment.
- RISC-V ACLINT: generated RTL from an executable spec and checked it formally against the golden model.
- Hiring and outreach: built interview frameworks, interviewed candidates, and supported university research collaborations.

`May 2023 - August 2023`  
**Tenstorrent, Santa Clara, CA**

*Platform Architecture Intern*

- Architected and studied multi-core, multi-chiplet fabric changes to improve performance efficiency and power tradeoffs for server-class compute subsystems.
- Estimated on-chip and off-chip traffic for power analysis and early system planning.
- Defined cache and fabric verification testplans for heterogeneous integration scenarios.
- Built workflows for multi-core and multi-chiplet traffic generation, testing, and simulation.
- Configured Arteris IP for non-coherent traffic and exercised corner cases relevant to fabric integration.

`May 2022 - August 2022`  
**Tenstorrent, Santa Clara, CA**

*Platform Architecture Intern*

- Contributed to architecture studies for a server-class RISC-V multicore CPU.
- Developed an in-house configurable fabric performance model for heterogeneous multicore systems.
- Defined configuration semantics to represent a broad design space across cores, caches, memory, and fabric options.

## Education

`2019 - 2025`  
**University of Michigan, Ann Arbor, MI**

- PhD in Computer Science and Engineering
- Thesis: *Streamlining High-Performance Heterogeneous Hardware Design*

`2022 - 2025`  
**University of Michigan, Ann Arbor, MI**

- Graduate Certificate in Innovation & Entrepreneurship

`2016 - 2019`  
**University of Michigan, Ann Arbor, MI**

- BSc in Computer Science with High Distinction

## Selected Publications

`2025`  
**Zipper: Latency-Tolerant Optimizations for High-Performance Buses**

- ASP-DAC 2025
- Demonstrated up to 8x speedup for one accelerator with 4.3% logic overhead, and 1.5x speedup for another with 0.9% overhead.

`2022`  
**Twine: A Chisel Extension for Component-Level Heterogeneous Design**

- DATE 2022
- Introduced a hardware-design methodology for composing heterogeneous systems at the component level.

`2023`  
**Security Verification of Low-Trust Architectures**

- CCS 2023, Distinguished Paper Award

Last updated: March 2026
