---
aliases:
- Command List
- Command Queue
- Offline Command Queue
sidebar_position: 1
sidebar_folder_position: 30
---
# Command Lists
Command Lists let you queue Z2K Templates commands as files — either individual `.json` files or batched `.jsonl` files — that the plugin processes automatically. This enables offline workflows, scheduled automation, and bulk operations without manual interaction. Each command file follows the [[JSON Packages]] specification.

## Contents
For more information, please see:
1. [[Command Lists Overview]] — What Command Lists are and how the queue system operates
2. [[Command Queue]] — Directory structure, processing order, scheduling, and settings
3. [[Retry and Error Handling]] — Retry logic, failure states, and archiving
4. [[Delayed Commands]] — Scheduling commands for future execution using `.delay.json` filename patterns
