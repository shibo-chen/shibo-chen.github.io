# Shibo Chen

Staff Architect \| Chiplet NoCs, coherent fabrics, memory systems, performance modeling, and AI-assisted hardware design

<div id="webaddress">Santa Clara, CA</div>
<div id="webaddress">
<a href="mailto:chshibo@outlook.com">chshibo@outlook.com</a>
| <a href="https://shibo-chen.github.io/">https://shibo-chen.github.io/</a>
| <a href="https://www.linkedin.com/in/shibo-chen-1314741b4/">LinkedIn</a>
| <a href="https://github.com/shibo-chen">GitHub</a>
</div>

## Summary

- Staff Architect at Tenstorrent, working across chiplet-based AI/ML accelerators and RISC-V CPU SoCs.
- Expertise in non-coherent and coherent (CHI) NoCs, D2D links, AXI/PCIe fabrics, and GDDR/LPDDR memory systems, backed by performance models correlated with RTL.
- Known for driving architecture decisions with clear models, tight cross-functional debug loops, and measurable focus on throughput, latency, utilization, power, and area.
- Builds fabric generators, executable specs, and formal checks that turn architecture into verified RTL.

## Core Skills

- AI Accelerator Architecture: chiplet-based AI/ML accelerator systems, system tradeoff analysis, performance target closure
- NoC and Interconnects: non-coherent and coherent (CHI) NoCs, on-package D2D, routing, QoS, topology, clocking, observability, RAS/debuggability
- Standards and Fabrics: AXI, CHI, PCIe, cache and fabric integration, heterogeneous SoC connectivity
- Memory Systems: GDDR/LPDDR/DDR controllers, memory-channel sizing, interleaving, bandwidth analysis, bottleneck removal
- Modeling and Analysis: performance models correlated with RTL, cycle-accurate simulators, workload characterization, latency/bandwidth/utilization studies
- Design Automation and Verification: fabric RTL generators, executable specifications, formal verification, AI-assisted RTL
- Execution: architecture specifications, design reviews, RTL/PD/verification/software debug, cross-team technical leadership

## Experience

`Oct 2026 - Present`  
**Tenstorrent, Santa Clara, CA**

*Staff Architect*

- Lead the in-house coherent fabric (CHI): transport, chip-to-chip links, and generators.
- Fabric lead for a RISC-V CPU chiplet SoC: integrate CPU clusters, the coherent fabric, IOMMU, timers, and an AI compute engine; firmware runs end to end in simulation.
- Lead AI-assisted hardware design: executable specs that generate golden models, RTL, and formal checks.
- Set performance-modeling direction across the AI NoC and the coherent CPU fabric.
- Mentor architects and interns; align modeling, RTL, and verification teams.

`May 2025 - Oct 2026`  
**Tenstorrent, Santa Clara, CA**

*Senior Architect*

- Chiplet NoC specs: owned non-coherent NoC specs for IO and LPDDR chiplets (topology, address maps, interleaving, KPIs, LPDDR controller width).
- NoC RTL and debug: integrated trace, remap, and timeout features in an IO-chiplet fabric; fixed head-of-line blocking to meet bandwidth targets.
- GDDR chiplet: drove bring-up, performance analysis, and debug: bandwidth correlation, unaligned-access fixes, and telemetry and timeout checks.
- Third-party IP: ran design reviews and evaluations of commercial NoC and memory IP; wrapped vendor models for in-house simulation.
- Performance modeling: CPU multicore scaling and SLC policies, AI-accelerator models correlated with RTL, and a cycle-accurate NoC simulator.
- Fabric generators: built an AXI fabric generator adopted by SoC teams, and the in-house CHI fabric's generator and formal environment.
- Spec platform: built the internal service that builds, hosts, and reviews architecture specs (live editing, comments, AI review); teams use it for chip spec sign-off.
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

`2023`  
**Security Verification of Low-Trust Architectures**

- CCS 2023, Distinguished Paper Award

`2022`  
**Twine: A Chisel Extension for Component-Level Heterogeneous Design**

- DATE 2022
- Introduced a hardware-design methodology for composing heterogeneous systems at the component level.

## Service

- Program Committee Member, IEEE International Conference on Computer Design (ICCD 2025)
- Program Committee Member, Workshop on Computer Architecture Modeling and Simulation (CAMS 2025)

Last updated: October 2026
