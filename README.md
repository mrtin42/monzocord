<img width="full" src="static/banner.png" alt="monzocord">
<p align="center">banking on discord? yep, i've lost it.</p>

---

<p></p>

> **note:** monzocord is in the early stages of development. it is not yet available for public use. similarly, monzocord will not be a publicly available bot for a long time due to the sensitive nature of the data it handles. this repository only acts as a proof of concept and a placeholder for the future release of monzocord. if you have any questions, check out the [FAQ](#faq) section or please use the contact information at [mbfrias.com/contact](https://mbfrias.com/contact).

monzocord allows you to view your monzo information within discord. it's safe, secure, and open source.
<br><br>
monzocord can also be configured with transaction notifications in DMs, helping you keep track of your spending. (am i seriously acting like the monzo app doesn't do this already?)
<br><br>
want to see what monzocord can do? well err uhh ERRR UMMM UHHH it doesnt do much yet. but it will. i promise. if you really want to know how it's all going to work, read the massive useless questions section below. there's a lot that has to be considered before this can be released.

> Monzo is a registered trademark of Monzo Bank Limited. This project is not affiliated with Monzo Bank Limited in any way. All trademarks are property of their respective owners. Neither Monzo Bank Limited nor any of its affiliates have endorsed or contributed to this project.

> monzocord handles sensitive banking information. By utilising monzocord, you accept that Monzo Bank Limited, Discord Inc., and developers of monzocord are not responsible for anything that may happen to your data. monzocord is open source, and you are free to inspect the code to ensure your data is safe.

## FAQ

### okay, what is it going to be?
what monzocord will be is the most far-fetched idea i've had in a while, because when people think "ah yes money debit cards bank", they don't think "discord bot". but i did. and i'm going to make it happen.

### that doesn't answer my question.
my bad og — monzocord will be a *user-install only* discord bot that will allow you to check your monzo balance, transactions, and more, entirely within your discord app library. it's safe, secure, and to prove 100% that i'm not stealing your data, its open source.

### how will it work?
very complicatedly, when it first launches.

### WHAT!? why?
integrating *banking*, of all things on god's green earth, into a discord bot is not easy. it's not like a music or utility bot, where you can just add it and its there for you. no. security and privacy are plastered all over this project, and it's going to be a long time before it can work like a normal bot, just add, auth, and go.

### okay, so ACTUALLY how will it work?
monzocord currently only exists as a sort of proof of concept. it's a webhook interpreter (or so i've decided to label it) that acts as a middleman between monzo's webhook subscription system and discord's webhook system, simply organising the data from a new transaction into a nice, neat, embed. it's not much, but it's a start.

when monzocord releases as a bot, it will initially be a **self-host only** bot, meaning you will have to host it yourself. the primary reason for this is that i don't want to be responsible for your data, and i don't want to be responsible for your data. im a 16 year old kid, not a bank whos held up to legal standards. therefore until i can be certain that i keep your data twenty-billion percent safe, which is a long way off, you will have to host it yourself.

once i figure out a way to make it safe, i will slowly phase out the self-hosting requirement, and eventually release it as a public bot.

### will it ever be installable to a server?
never.

monzocord handles your sensitive banking data, meaning the messages it sends you will probably be something you don't want other people to regularly see. sure, if you feel like gloating in a dm, gc, or server with external apps visible, go ahead (there'll be an option for your response to not be ephemeral), but i'm not going to let you install it to a server, as it makes it too easy for someone to see your data.

### okay, so when will it be released?
why would i know? i've got bigger fish to fry. im flunking maths and physics HARD, and i've got other working projects to maintain. don't get me wrong, i will be working my socks off on this daily, but it will be the furthest from fast.

### okay, so how can i help?
to be absolutely honest, because i need a concrete plan on how to make this safe, i can't really accept help right now. unless you have ideas for super secure data handling, you're just going to have to hold your horses.