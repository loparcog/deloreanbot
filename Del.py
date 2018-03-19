import discord
import asyncio
from discord.ext.commands import bot
from discord.ext import commands

Client = discord.Client()
bot_prefix= "./"
client = commands.Bot(command_prefix = bot_prefix)

@client.event
async def on_ready():
    print("Bot online")
    print("Name: {}".format(client.user.name))
    print("ID: {}".format(client.user.id))

@client.command(pass_context = True)
async def ping():
    await client.say("Pong!")

@client.command(pass_context = True)
async def test():
    await client.say(":\feline:")

    
client.run("bot key")

    
