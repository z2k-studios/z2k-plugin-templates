---
sidebar_position: 20
title: Installing via BRAT
aliases:
  - Installing via BRAT
  - BRAT installation
---
# Installing via BRAT
BRAT (Beta Reviewer's Auto-update Tool) lets you install pre-release versions of plugins directly from GitHub — before they appear in the official community directory. 

> [!INFO] Advanced Installation
> This method is intended for users who want access to the latest pre-release builds of Z2K Templates.

## Prerequisites
BRAT must be installed and enabled in your vault before you can use it to add Z2K Templates. If you don't have it yet:
1. Open **Settings → Community plugins**
2. Click **Browse** and search for **BRAT**
3. Install and enable it

## Installing Z2K Templates
With BRAT installed and enabled:
1. Open the **Command Palette** (`Ctrl/Cmd + P`)
2. Run the command **BRAT: Add a beta plugin for testing**
3. In the dialog that appears, paste the following GitHub URL:
   `https://github.com/z2k-studios/z2k-plugin-templates`
4. Click **Add Plugin** and wait for BRAT's confirmation
5. Navigate to **Settings → Community plugins**
6. Find **Z2K - Templates** in the list and toggle it **on**

Z2K Templates is now installed and active. Head to [[Introduction]] to get started.

## Keeping Z2K Templates Updated
BRAT can check for and apply updates automatically. To update manually, open the Command Palette and run **BRAT: Check for updates to all beta plugins and UPDATE**. To enable automatic updates on Obsidian launch, open the BRAT settings tab and turn on the auto-update option.

> [!DANGER] INTERNAL NOTES
> - Testing Items:
>   - #TEST/User: Verify the exact BRAT command name is "BRAT: Add a beta plugin for testing"
>   - #TEST/User: Confirm the plugin appears as "Z2K - Templates" in the Community plugins list after BRAT installation
>   - #TEST/User: Verify the manual update command name is accurate
