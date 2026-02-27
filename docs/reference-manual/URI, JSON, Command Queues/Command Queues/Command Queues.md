---
aliases:
- Command Queue
- Command Queues
- Command List
- Command Lists
- Offline Command Queue
sidebar_position: 1
sidebar_folder_position: 30
---
# Command Queues
Command Queues let you feed Z2K Templates commands as files – either individual `.json` files or batched `.jsonl` files – that the plugin processes automatically. This enables offline workflows, scheduled automation, and bulk operations without manual interaction. Each command file follows the [[JSON Packages]] specification.

Truly, this is a powerful feature. It enables data to be queued up for insertion into your Obsidian vault without having Obsidian to be actively running at the time. When Obsidian launches, then the Z2K Templates Plugin will begin the work of processing the commands.

## Contents
For more information, please see:
1. [[Command Queues Overview]] – What Command Queues are, why they exist, and how the system works at a high level
2. [[Queue Directory]] – Where command files live and how the directory is structured
3. [[Queue Processing]] – How files are picked up, ordered, and executed
4. [[Queue Settings]] – Configuration options for the Command Queue system
5. [[Command File Lifecycle]] – The states a command file moves through from creation to completion
6. [[Retry and Error Handling]] – Retry logic, failure classification, and error recovery
7. [[Delayed Commands]] – Scheduling commands for future execution
8. [[Debugging Command Queues]] – Diagnosing stuck, failed, or misbehaving commands
