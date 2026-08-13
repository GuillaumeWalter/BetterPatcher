#!/usr/bin/env node
/**
 * Register Easy Patch slash commands with Discord.
 * Usage: DISCORD_BOT_TOKEN=... DISCORD_APPLICATION_ID=... node scripts/register-discord-commands.mjs
 */

const token = process.env.DISCORD_BOT_TOKEN?.trim();
const appId = process.env.DISCORD_APPLICATION_ID?.trim();

if (!token || !appId) {
  console.error("Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID.");
  process.exit(1);
}

const commands = [
  {
    name: "easypatch",
    description: "Easy Patch — link channel or check status",
    options: [
      {
        type: 1,
        name: "link",
        description: "Link this channel to your Easy Patch account",
        options: [
          {
            type: 3,
            name: "code",
            description: "6-character code from Easy Patch Settings",
            required: true,
          },
        ],
      },
      {
        type: 1,
        name: "status",
        description: "Check Easy Patch bot status",
      },
    ],
  },
];

const response = await fetch(
  `https://discord.com/api/v10/applications/${appId}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  },
);

const text = await response.text();
if (!response.ok) {
  console.error("Failed to register commands:", response.status, text);
  process.exit(1);
}

console.log("Discord commands registered:", text);
