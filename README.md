# Reddit Scraper

![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Bun](https://img.shields.io/badge/bun-%3E%3D1.2.5-black)
![License](https://img.shields.io/badge/license-MIT-green)

Reddit Scraper is an open-source Reddit intelligence and scraping tool that collects subreddit posts and comments from any topic or search query, then generates AI-powered reports with sentiment analysis, key themes, notable quotes, and top post rankings.

Built for developers, marketers, founders, and researchers, it combines [Decodo Web Scraping API](https://decodo.com/scraping/web) with LLM-based analysis to turn raw Reddit discussions into structured, actionable insights without manual browsing.

## Features

- **Scrape subreddits, posts, and comments**. Collect Reddit discussions from any topic, keyword, or search query.
- **AI-powered executive summaries**. Generate structured overviews of what Reddit users are saying.
- **Sentiment analysis**. Understand whether discussions are positive, negative, or mixed.
- **Key theme extraction**. Identify recurring talking points and dominant discussion patterns.
- **Notable quotes and insights**. Surface representative or impactful Reddit comments automatically.
- **Top post ranking**. Highlight the most relevant and upvoted posts across scraped results.
- **Markdown and JSON export**. Download structured reports for further analysis or sharing.

## How it works

1. **Enter a topic**. Provide a prompt or research question such as "What do developers think about AI coding tools?".

2. **Review the scraping plan**. The LLM suggests relevant subreddits and search queries before scraping begins. You can review and edit the plan before running it.

3. **Generate an intelligence report**. Reddit posts and comments are scraped through the Decodo Web Scraping API, then analyzed by the LLM to produce a structured report with summaries, themes, sentiment analysis, and notable insights.

4. **Export the results**. Download the generated report as Markdown or JSON for further analysis, reporting, or sharing.

## Example report output

<details>
<summary>View example JSON report</summary>

```json
{
  "id": "6a06e47b800ec8d26cd5547d",
  "plan": {
    "prompt": "best sampler",
    "subreddits": [
      "wearethemusicmakers",
      "musicproduction",
      "edmproduction",
      "makinghiphop",
      "musicinthemaking",
      "songwriting",
      "audioengineering",
      "mixingmastering",
      "homestudios",
      "synthesizers",
      "ableton"
    ],
    "queries": [
      "best sampler",
      "\"best sampler\"",
      "sampler recommendations",
      "hardware sampler vs software",
      "MPC vs SP404",
      "OP-XY"
    ],
    "timeRange": "year"
  },
  "posts": [
    {
      "id": "1p6d4wk",
      "title": "The best seller from my pie pop up: The Thanksgiving Sampler",
      "subreddit": "Baking",
      "author": "simplyplated",
      "upvotes": 13979,
      "commentCount": 285,
      "url": "https://www.reddit.com/gallery/1p6d4wk",
      "permalink": "/r/Baking/comments/1p6d4wk/the_best_seller_from_my_pie_pop_up_the/",
      "selftext": "Pomegranate Molasses Pecan\nBrown Butter Apple Crumble\nPumpkin Chai \nCranberry Curd",
      "createdAt": 1764079177
    },
    {
      "id": "1kwyj2b",
      "title": "After latest KO2 update, it feels like it’s gotta be the best sampler in its price range.",
      "subreddit": "synthesizers",
      "author": "wes-manbaby",
      "upvotes": 564,
      "commentCount": 182,
      "url": "https://v.redd.it/gkagx5uo0e3f1",
      "permalink": "/r/synthesizers/comments/1kwyj2b/after_latest_ko2_update_it_feels_like_its_gotta/",
      "selftext": "Crazy part is it getting sidechaining before the SP404.  My fav addition definitely the added voices.  Started this tune little while ago then the update made it so easy to finish finally. \n\n Oh it’s boombap, pass if you don’t like hip hop.",
      "createdAt": 1748379208
    },
    {
      "id": "1lry98v",
      "title": "Flux Kontext Best Sampler/Scheduler?",
      "subreddit": "comfyui",
      "author": "Appropriate_Bug_6881",
      "upvotes": 35,
      "commentCount": 16,
      "url": "https://www.reddit.com/r/comfyui/comments/1lry98v/flux_kontext_best_samplerscheduler/",
      "permalink": "/r/comfyui/comments/1lry98v/flux_kontext_best_samplerscheduler/",
      "selftext": "Hey all,\n\n  \nWhat is your experience for the best sampler/scheduler combo for flux kontext dev?\n\n",
      "createdAt": 1751678100
    },
    {
      "id": "1n9p1ge",
      "title": "my boyfriend sold my mtg beta black lotus card",
      "subreddit": "BestofRedditorUpdates",
      "author": "Direct-Caterpillar77",
      "upvotes": 12388,
      "commentCount": 497,
      "url": "https://www.reddit.com/r/BestofRedditorUpdates/comments/1n9p1ge/my_boyfriend_sold_my_mtg_beta_black_lotus_card/",
      "permalink": "/r/BestofRedditorUpdates/comments/1n9p1ge/my_boyfriend_sold_my_mtg_beta_black_lotus_card/",
      "selftext": "**I am not The OOP, OOP is u/brokenhearted5150**\n\n**my boyfriend sold my mtg beta black lotus card**\n\n**TRIGGER WARNING:** &gt;!theft, betrayal!&lt;\n\n[Original Post](https://www.reddit.com/r/relationship_advice/comments/3j9i97/my_boyfriend_sold_my_mtg_beta_black_lotus_card/?utm_source=share&amp;utm_medium=mweb3x&amp;utm_name=mweb3xcss&amp;utm_term=1&amp;utm_content=share_button)  **Sept 1, 2015**\n\nI'm on mobile so sorry for the format. I am so distraught. my boyfriend well call him Shane sold my black lotus beta card. now for those of you that don't know, this card is worth $20,000 right now. I was never planning to sell it. I got it from my mom for a birthday present when i first started playing magic. My mom has passed now and that is one of the things I treasure from her. I don't know what to do, I'm very upset and he won't tell me where he sold it so I could get it back. Please give me some advice, thank you\n\ntdlr: my boyfriend sold my mtg beta black lotus magic card. I don't know what to do now.\n\nEdit: the price. forgot the dollar sign, sorry I was a little distraught when I typed this.\n\n**RELEVANT COMMENTS**\n\n**downvoted commenter**\n\n&gt;not worth 20k you can get it for a lot less on ebay unless you got it graded\n\n\n**OOP**\n\n&gt;&gt;It's a Beta Black  Lotus.  It's in mint condition and has been in a glass case since I got it. \n\n**Slasher1309**\n\n&gt;Do you remember what it was graded? \n\n**OOP**\n\n&gt;&gt;NM\n\n**Slasher1309**\n\n&gt;&gt;&gt;Was the card ever submitted for formal grading by BSG or another grading company, [like this one?](http://static.starcitygames.com/sales//cardscans/GRADED/BGS/0005038624_lg.jpg) Because if it has, and the grade is 9 or higher, ~~it~~ *the* card could be worth even more than $20,000.\n\n**OOP**\n\n&gt;&gt;&gt;&gt;yes and it was an 8.\n\n**~**\n\n**Lord_Alamo**\n\n&gt;If you don't have any major ties to the guy dump him if he doesnt give it back or give you 20k.\n\n&gt;Edit: You cant be with a guy that steals from you. He might not know if it cost 100 or 20 000.... but stealing is never ok\n\n**causa-sui**\n\n&gt;&gt;Based on the OP, she's been playing Magic for years, maybe decades. Most players will have thousands or even tens of thousands of cards after playing that long. \n\n&gt;&gt;Therefore, there's no way he didn't know what it's worth, or else he wouldn't have chosen that particular card to sell.\n\n**OOP**\n\n&gt;&gt;&gt;He could of taken any of my mythic rares, but he chose that one. My collection without my black lotus is probably worth at least 40k. Lots of foil cards\n\n**~**\n\n**[deleted]**\n\n&gt;How much did he sell it for and what happened to the money?\n\n**OOP**\n\n&gt;&gt;15k. I dont know what happened to the money, he wont tell me.\n\n**When asked if the money went to drugs**\n\n&gt;yes im pretty sure hes back into drugs again \n\n**Editors Note: I did a quick Google search, and while prices vary, using OOP's specs i found a [Black Lotus Beta card currently for $42,500](https://imgur.com/a/sXyXuKC)**\n\n**OOP updated Next Day Sept 2, 2015/Same Post**\n\nI went to the police station last night, computer in hand and told them that my card was stolen. They had a hard time believing that my card cost so much so I showed them. They said they would look into it. Then i called my renters insurance and they said i would get my money back. I finally found out where he sold the card to and i called the shop and told them it was stolen, there was so much arguing to get the card back and I had to go down there. I got my card back after telling them I was going to call the police and had them arrested for having stolen property. They cooperated and gave it back. As for the bf, he is an ex now. I packed up all his shit and left it outside and changed the locks. As far as i know, his mother came to get his stuff. So thank you for the advice Reddit, you helped me out tons!\n\n\n**THIS IS A REPOST SUB - I AM NOT THE OOP** \n\n**DO NOT CONTACT THE OOP's OR COMMENT ON LINKED POSTS, REMEMBER - RULE 7**",
      "createdAt": 1757128610
    },
    {
      "id": "1mqtn9b",
      "title": "Best Sampler for Wan2.2 Text-to-Image?",
      "subreddit": "StableDiffusion",
      "author": "CutLongjumping8",
      "upvotes": 21,
      "commentCount": 27,
      "url": "https://www.reddit.com/gallery/1mqtn9b",
      "permalink": "/r/StableDiffusion/comments/1mqtn9b/best_sampler_for_wan22_texttoimage/",
      "selftext": "In my tests it is Dpm\\_fast + beta57. Or I am wrong somewhere? \n\nMy test workflow here - [https://drive.google.com/file/d/19gEMmfdgV9yKY\\_WWnCGG6luKi6OxF5OV/view?usp=drive\\_link](https://drive.google.com/file/d/19gEMmfdgV9yKY_WWnCGG6luKi6OxF5OV/view?usp=drive_link)",
      "createdAt": 1755252980
    },
    {
      "id": "1p6d580",
      "title": "The best seller from my pie pop up: The Thanksgiving Sampler",
      "subreddit": "pie",
      "author": "simplyplated",
      "upvotes": 465,
      "commentCount": 33,
      "url": "https://www.reddit.com/gallery/1p6d4wk",
      "permalink": "/r/pie/comments/1p6d580/the_best_seller_from_my_pie_pop_up_the/",
      "selftext": "",
      "createdAt": 1764079200
    },
    {
      "id": "1qe39bj",
      "title": "For you all, what’s the best sampler and scheduler combination?",
      "subreddit": "ZImageAI",
      "author": "IGP31",
      "upvotes": 20,
      "commentCount": 13,
      "url": "https://i.redd.it/ldz2k3mlcmdg1.png",
      "permalink": "/r/ZImageAI/comments/1qe39bj/for_you_all_whats_the_best_sampler_and_scheduler/",
      "selftext": "I usually use ***Euler - simple***, also ***res\\_multistep-beta***, but I tried ***dpm\\_2-simple***, and it gave me good results.\n\n Have you tried any other good combinations in ZIT?\n\nWorkflow: [https://civitai.com/models/2312428?modelVersionId=2601663](https://civitai.com/models/2312428?modelVersionId=2601663)",
      "createdAt": 1768529422
    },
    {
      "id": "1mfzvl5",
      "title": "Debate!  Best Wan 2.2 t2v settings (steps, sampler, cfg, speed loras, etc.)",
      "subreddit": "StableDiffusion",
      "author": "terrariyum",
      "upvotes": 254,
      "commentCount": 169,
      "url": "https://i.redd.it/auffex7axngf1.png",
      "permalink": "/r/StableDiffusion/comments/1mfzvl5/debate_best_wan_22_t2v_settings_steps_sampler_cfg/",
      "selftext": "# I'll go first:\n\n* **cfg:**  3.5 (both) 😭\n   * This is the most important:  cfg = 1 makes results lousy.  It destroys prompt adherence, especially to fancy lighting, camera angle, and camera movement, and emotions, i.e. the whole point of Wan 2.2.  I was wondering why my results weren't as good as the posts I was seeing here, and this is why.  Maybe cfg = 1 works good enough for i2v - I haven't tried.  \n* **lightx2v/causvid:**  no 😭\n   * I've tried every combo with either or both ksamplers, and even at low strength, and even with cfg &gt;1, they make the quality obviously worse.  Not just details - they reduce the variety of bodies, faces, and backgrounds.  I you want to use these, you may as well use Wan 2.1.  Let's hope a new version is trained just for Wan 2.2 soon.\n* **negative attention guidance:**  no\n   * This is a moot point if you're using cfg &gt;1, which I strongly recommend.  With cfg = 1, I find that NAG makes the aesthetics slightly worse, but it's effective, so I only turn it on if I need a specific negative, not for \"oversaturated\", etc.\n* **clownsharksampler:**  yes 🚀\n   * Bongmath noticeably improves prompt adherence, variety, and detail\n* **samplers:** res\\_X  🚀 🌙 🧑‍🚀 🏁 \n   * These samplers are night and day better than euler / lcm / uni\\_pc.  They create far superior prompt adherence, variety, detail, and removal of artifacting.  res\\_2s is twice as slow as res\\_2m, but make noticeably better results.  I've found that res\\_2m is good enough for the (first) high noise pass, and I use res\\_2s for the (second) low noise pass.\n* **schedulers:**  bong\\_tangent or beta57\n   * It's a tossup for me.\n* **total steps:**  20-30 (even split 10-10 or 15-15 between ksamplers)\n   * Without speed loras, 10 looks bad.  30 looks noticeably better than 20.  I can't see the difference after 30.  I also tried limited tests with splitting 10-20 or 20-10, but even split seems best.\n* **eta:** 0.5\n   * This is a clownsharksampler setting. 0.0 disables bongmath, while 1.0 looks bad.  I haven't tried other middle values.\n* **sage attention:**  yes, it's free\n* **shift:**  1-8\n   * I can't find the pattern.  How this value impacts results seems random.\n\n\n\n# Render time on 4090 with these settings:\n\n* 81 frames, 640x480, block swap 0: \n   * 595s, \\~7s/frame, \\~2.4s/100k pixels\n* 41 frames, 960x720, block swap 0:\n   * 733s, \\~18s/frame, \\~2.6s/100k pixels\n\nGenerating at 720p isn't only good for adding details, it also reduces artifacts slop that can't be fixed by upscale.  I haven't tried 81 frames at 720p because it would need a block swap of 10 with 24gb VRAM, and probably &gt;40m to render.\n\n# Wan 2.2 t2v thoughts \n\nWith these settings, the visual results match closed source, but the speed makes it not economical.  Don't get me wrong, I'm grateful for open source!  But just the \\~$0.50l/hr cost of a cloud 4090 GPU makes generating full quality 720p more expensive than closed source.  Of course, it's the only option for uncensored content.\n\nThe other problem is that t2v is unpredictable.  You're gonna need to reroll a ton.  Also with t2v, the same seed at lower resolution or fewer frames produces completely different results.  So there's no way to preview.  For now I'm sticking with i2v, and I can't wait for Wan 2.2 VACE.\n\nI'd love to hear your experience!  ",
      "createdAt": 1754165070
    },
    {
      "id": "1npmbqz",
      "title": "Who is the best Sampler?",
      "subreddit": "sampling",
      "author": "MauiGoon",
      "upvotes": 16,
      "commentCount": 63,
      "url": "https://www.reddit.com/r/sampling/comments/1npmbqz/who_is_the_best_sampler/",
      "permalink": "/r/sampling/comments/1npmbqz/who_is_the_best_sampler/",
      "selftext": "No right or wrong answer here, just thought I’d get people’s opinions on this topic. \n\nI really like Daft Punk’s Sampling style as well as Hideki Naganuma (Jet Set Radio soundtrack)\n\n\n\n\n",
      "createdAt": 1758743924
    },
    {
      "id": "1t7n00g",
      "title": "If you had to create a Best Of album for TMBG what would you pick if you had 20 tracks to cram onto a disc? Would you prioritize showing off their best work or a best sampler for their entire discography?",
      "subreddit": "tmbg",
      "author": "Ill_Engineering_5434",
      "upvotes": 36,
      "commentCount": 45,
      "url": "https://www.reddit.com/r/tmbg/comments/1t7n00g/if_you_had_to_create_a_best_of_album_for_tmbg/",
      "permalink": "/r/tmbg/comments/1t7n00g/if_you_had_to_create_a_best_of_album_for_tmbg/",
      "selftext": "If we were just foing personal favorites with no attempt at  representing their full discography i'd go\n\n1.  Metal Detector\n2. Ana Ng\n3. The Statue Got Me High\n4. Snowball in Hell\n5. I Palindrome I\n6. Thunderbird\n7. They'll Need a Crane\n8. Spiraling Shape\n9. Birdhouse in Your Soul\n10. Your Probably Get That a Lot\n11. Erase\n12. We Want a Rock\n13. Unpronouncable\n14. Hey Mr. DJ I Thought You Said We Had a Deal\n15. I Love You for Psychological Reasons\n16. Lucky Ball and Chain\n17. I've Got a Match\n18. Answer\n19. Careful What You Pack\n20. Don't Let's Start\n\n  \nNot the most comprehensive listing and mostly showcases their earlier stuff and while I really like a lot of their newer stuff and find those more recent albums to be much more consistent I like how in those early albums for every couple of bizzare novelty songs they dropped pure genius.\n\n",
      "createdAt": 1778279782
    },
    {
      "id": "1sn0hqd",
      "title": "Hardware damage Vs Software Damage",
      "subreddit": "CricketShitpost",
      "author": "CycleLongjumping2972",
      "upvotes": 1264,
      "commentCount": 31,
      "url": "https://i.redd.it/u9i8rfxbdjvg1.jpeg",
      "permalink": "/r/CricketShitpost/comments/1sn0hqd/hardware_damage_vs_software_damage/",
      "selftext": "",
      "createdAt": 1776338155
    },
    {
      "id": "1p52bee",
      "title": "AITAH for calling the manager of a corporate restaurant to verify what my server told me?",
      "subreddit": "AITAH",
      "author": "little_Druid_mommy",
      "upvotes": 2374,
      "commentCount": 604,
      "url": "https://www.reddit.com/r/AITAH/comments/1p52bee/aitah_for_calling_the_manager_of_a_corporate/",
      "permalink": "/r/AITAH/comments/1p52bee/aitah_for_calling_the_manager_of_a_corporate/",
      "selftext": "So today I (30f) went to a corporate restaurant with my husband (32m) and our child (4yo). Husband orders and appetizer sampler, kiddo gets a corn dog with fries and fruit (upcharge) and I ordered a tex-mex-esk chicken rice bowl. My husband's food is hot, our kid's food is hot, my food is COLD. Not just the cold toppings and the top layer of my rice due to the cold toppings, but my chicken and the entirety of my rice feel as though they were put in the cooler. My dish is advertised on the menu as a HOT dish.\n\nI get our server's (early 20s F) attention and ask her if this is correct. She informed me that due to the cold toppings that my rice and chicken would be cold and that she has had several people ask the same question and that this is how it is. I ask her if she is aware that it doesn't mention that it is a chilled dish on the menu and tell her that if this is actually supposed to be a cold she needs to do her due diligence as a server and inform her guests so we can make an informed decision regarding our food since the menu is not.\n\nMy husband then mentions that I'm also a server and rarely ever bring things to a fellow server's attention. She asked me where I work, I tell her and suggest that since she has had multiple people have this exact inquiry, that maybe she should add it to her repertoire for this particular product, as is customary for most servers after getting MULTIPLE complaints/notes about THE SAME THING.\n\nShe apologized, but made no recommendations about rectifying the situation, didn't even grab the manager to come talk to me about it. In service, in EVERY place I've worked (from little mom &amp; pops to corporate to fine dining) the minute a server has a complaint from a table, a manager is supposed to be informed and the manager comes to speak to the table. Doesn't matter why, what, nothing. A manager should have been at my table immediately after my inquiry to verify and/or rectify.\n\nWe paid our tab, in full, and I still left our normal tip amount ($15 on $52). I ended up taking all my food home to heat up in the microwave.\n\nSince management didn't come to the table to discuss things, I called them a time later after finishing our errands to talk about how they need to change the description on the menu so guests can make informed decisions regarding whether or not they want a chilled dish that isn't a salad. Wouldn't you know, my rice AND chicken both should have been HOT. I told the manager what the server relayed to me and he told me he was very sorry, but the server was very wrong and asked what she did to rectify the situation; manager touch, replace food for hot, make a different item, discount off the bill, etc. I told him she absolutely did none of those things and if I had spoken to the manager on duty I absolutely would not be calling and taking this up with him over the phone.\n\nI explained that I could excuse things being a one off had the server not told me she gets this complaint often and that I was simply calling to ask them to do their due diligence on informing guests that it was a chilled dish, but since speaking to him that I'm rather upset at being lied to over something that could have been a super easy fix. As service industry, I get that shit happens, especially considering the establishment we went into, I'd have been happy with them throwing the whole dish in a pan and heating it up for two minutes and it not looking like it's advertised and it being a tex-mex-esk stir fry! But food shouldn't be left to die in the window or sent out cold when they should be hot. I wasn't even calling to complain for myself, for the most part (I NEVER call in to complain!), but for the fact that this is a recurring complaint that hasn't been rectified one way or another.\n\nHe apologized profusely and told me he will get to the bottom of as to why this has been a reoccurring problem, according to his staff, and thanked me for bringing it to his attention. He took my information (email, name, server's name, and details of my complaint) and told me that the district manager would be in touch in the coming days. I thanked him and apologized for causing him additional stress and work when I know how busy Sundays can get.\n\nI know if any of my managers had gotten this call, there would be some strongly expressed words in private and in front of everyone without naming the server to make sure everyone knows how to handle this from now on. That's not even getting into how they would talk to kitchen staff regarding how it got past the cooks AND expo...\n\nSo, AITAH for calling and verifying what my server said to me with management? ",
      "createdAt": 1763943036
    },
    {
      "id": "1pi2i67",
      "title": "when an upscaler is so good it feels illegal",
      "subreddit": "comfyui",
      "author": "Ok-Page5607",
      "upvotes": 1004,
      "commentCount": 313,
      "url": "https://v.redd.it/k09ygm7ay46g1",
      "permalink": "/r/comfyui/comments/1pi2i67/when_an_upscaler_is_so_good_it_feels_illegal/",
      "selftext": "I'm absolutely in love with SeedVR2 and the FP16 model. Honestly, it's the best upscaler I've ever used. It keeps the image exactly as it is. no weird artifacts, no distortion, nothing. Just super clean results.\n\nI tried GGUF before, but it messed with the skin a lot. FP8 didn’t work for me either because it added those tiling grids to the image.\n\nSince the models get downloaded directly through the workflow, you don’t have to grab anything manually. Just be aware that the first image will take a bit longer.\n\nI'm just using the standard SeedVR2 workflow here, nothing fancy. I only added an extra node so I can upscale multiple images in a row.\n\nThe base image was generated with Z-Image, and I'm running this on a 5090, so I can’t say how well it performs on other GPUs. For me, it takes about 38 seconds to upscale an image.\n\nHere’s the workflow:\n\n[https://pastebin.com/V45m29sF](https://pastebin.com/V45m29sF)\n\nTest image:\n\n[https://imgur.com/a/test-image-JZxyeGd](https://imgur.com/a/test-image-JZxyeGd)\n\nCustom nodes:  \nfor the vram cache nodes (It doesn't need to be installed, but I would recommend it, especially if you work in batches)  \n[https://github.com/yolain/ComfyUI-Easy-Use.git](https://github.com/yolain/ComfyUI-Easy-Use.git)\n\nSeedvr2 Nodes\n\n[https://github.com/numz/ComfyUI-SeedVR2\\_VideoUpscaler.git](https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler.git)\n\nFor the \"imagelist\\_from\\_dir\" node  \n[https://github.com/ltdrdata/ComfyUI-Inspire-Pack](https://github.com/ltdrdata/ComfyUI-Inspire-Pack)\n\n`Just an update, this was the max resolution I can run this workflow with a 5090 in just 98 seconds for 8500x5666px. Maybe there is way to go even further with this workflow?`\n\n  `███████╗███████╗███████╗██████╗ ██╗   ██╗██████╗     ██████╗       ███████╗`\n\n   `██╔════╝██╔════╝██╔════╝██╔══██╗██║   ██║██╔══██╗    ╚════██╗      ██╔════╝`\n\n   `███████╗█████╗  █████╗  ██║  ██║██║   ██║██████╔╝     █████╔╝      ███████╗`\n\n   `╚════██║██╔══╝  ██╔══╝  ██║  ██║╚██╗ ██╔╝██╔══██╗    ██╔═══╝       ╚════██║`\n\n   `███████║███████╗███████╗██████╔╝ ╚████╔╝ ██║  ██║    ███████╗  ██╗ ███████║`\n\n   `╚══════╝╚══════╝╚══════╝╚═════╝   ╚═══╝  ╚═╝  ╚═╝    ╚══════╝  ╚═╝ ╚══════╝`\n\n   `v2.5.19                                    © ByteDance Seed · NumZ · AInVFX`\n\n   `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`\n\n\n\n`[06:43:43.396] 🏃 Creating new runner: DiT=seedvr2_ema_7b_fp16.safetensors, VAE=ema_vae_fp16.safetensors`\n\n`[06:43:43.415] 🚀 Creating DiT model structure on meta device`\n\n`[06:43:43.596] 🎨 Creating VAE model structure on meta device`\n\n`[06:43:45.992]`\n\n`[06:43:45.992] 🎬 Starting upscaling generation...`\n\n`[06:43:45.992] 🎬   Input: 1 frame, 3600x2400px → Padded: 8512x5680px → Output: 8500x5666px (shortest edge: 8500px, max edge: 8500px)`\n\n`[06:43:45.993] 🎬   Batch size: 1, Temporal overlap: 16, Seed: 4105349922, Channels: RGB`\n\n`[06:43:45.993]`\n\n`[06:43:45.993]  ━━━━━━━━ Phase 1: VAE encoding ━━━━━━━━`\n\n`[06:43:45.993] ⚠️ [WARNING] temporal_overlap &gt;= batch_size, resetting to 0`\n\n`[06:43:45.994] 🎨 Materializing VAE weights to CPU (offload device):` \n\n`[06:43:46.562] 🎨 Encoding batch 1/1`\n\n`[06:43:46.597] 📹   Sequence of 1 frames`\n\n`[06:43:46.680] 🎨   Using VAE tiled encoding (Tile: (1024, 1024), Overlap: (128, 128))`\n\n`[06:43:56.426]`\n\n`[06:43:56.426]  ━━━━━━━━ Phase 2: DiT upscaling ━━━━━━━━`\n\n`[06:43:56.434] 🚀 Materializing DiT weights to CPU (offload device):` \n\n`[06:43:56.488] 🔀 BlockSwap: 36/36 transformer blocks offloaded to CPU`\n\n`[06:43:56.566] 🎬 Upscaling batch 1/1`\n\n`EulerSampler: 100%|██████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:52&lt;00:00, 52.18s/it]`\n\n`[06:44:48.856]`\n\n`[06:44:48.856]  ━━━━━━━━ Phase 3: VAE decoding ━━━━━━━━`\n\n`[06:44:48.856] 🔧 Pre-allocating output tensor: 1 frames, 8500x5666px, RGB (0.27GB)`\n\n`[06:44:48.970] 🎨 Decoding batch 1/1`\n\n`[06:44:48.974] 🎨   Using VAE tiled decoding (Tile: (1024, 1024), Overlap: (128, 128))`\n\n`[06:45:10.689]`\n\n`[06:45:10.690]  ━━━━━━━━ Phase 4: Post-processing ━━━━━━━━`\n\n`[06:45:10.690] 📹 Post-processing batch 1/1`\n\n`[06:45:12.765] 📹   Applying LAB perceptual color transfer`\n\n`[06:45:13.057] 🎬 Output assembled: 1 frames, Resolution: 8500x5666px, Channels: RGB`\n\n`[06:45:13.058]`\n\n`[06:45:13.130] ✅ Upscaling completed successfully!`\n\n`[06:45:15.382] ⚡ Average FPS: 0.01 frames/sec`\n\n`[06:45:15.383]`\n\n`[06:45:15.383]  ────────────────────────`\n\n`[06:45:15.383] 💬 Questions? Updates? Watch the videos, star the repo &amp; join us!`\n\n`[06:45:15.384] 🎬` [`https://www.youtube.com/@AInVFX`](https://www.youtube.com/@AInVFX)\n\n`[06:45:15.384] ⭐` [`https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler`](https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler)\n\n`Prompt executed in 98.46 seconds`",
      "createdAt": 1765269817
    },
    {
      "id": "1rk5feh",
      "title": "Is there any better way to find the best sampler and scheduler?",
      "subreddit": "comfyui",
      "author": "Rigonidas",
      "upvotes": 15,
      "commentCount": 33,
      "url": "https://i.redd.it/3m2vl47j1xmg1.jpeg",
      "permalink": "/r/comfyui/comments/1rk5feh/is_there_any_better_way_to_find_the_best_sampler/",
      "selftext": "I am going through every sampler. Then I think one doesn’t work and I switch the scheduler and I love some of the outputs. \n\nI’m going down the list with the same prompts. Making notes. But this is just for anime/comic art style. I assume it’s all different for 3D, fantasy, photo realism, etc. \n\nIs this really what I need to do? I suppose it is a good way to learn. ",
      "createdAt": 1772581051
    },
    {
      "id": "1p4bpkf",
      "title": "Let’s see. Which sampler is the best?",
      "subreddit": "NBAYoungboy",
      "author": "OgMaro_7",
      "upvotes": 41,
      "commentCount": 35,
      "url": "https://www.reddit.com/gallery/1p4bpkf",
      "permalink": "/r/NBAYoungboy/comments/1p4bpkf/lets_see_which_sampler_is_the_best/",
      "selftext": "If I’m being honest, I think masa’s sampler is better lol ",
      "createdAt": 1763866490
    },
    {
      "id": "1r4gzsk",
      "title": "I got tired of guessing which Model/Prompt/Sampler/Scheduler/Lora/Step/CFG combo work best, so I built some custom nodes for testing and viewing results inside ComfyUI! Feedback appreciated!",
      "subreddit": "comfyui",
      "author": "JasonHoku",
      "upvotes": 303,
      "commentCount": 50,
      "url": "https://v.redd.it/453q14j8mfjg1",
      "permalink": "/r/comfyui/comments/1r4gzsk/i_got_tired_of_guessing_which/",
      "selftext": "🔗 Link to GitHub: [https://github.com/JasonHoku/ComfyUI-Ultimate-Auto-Sampler-Config-Grid-Testing-Suite](https://github.com/JasonHoku/ComfyUI-Ultimate-Auto-Sampler-Config-Grid-Testing-Suite)  \n \n\nOr find it in Comfy Manager: ComfyUI-Ultimate-Auto-Sampler-Config-Grid-Testing-Suite\n  \n  \nUse the Builder Node to whip up your own iterations and easily test tons of models, loras, prompts, everything! Or just write or plug in some JSON and get a grid of results!  \n  \n \n\nIt auto-generates grids based on your inputs (e.g., 3 samplers × 2 schedulers × 2 CFG x ALL LoRAs in FolderA in either each for each or combined!) and renders them in a zoomable, infinite-canvas dashboard.\n\n**The cool stuff:**\n* **Visual Config Builder**: A GUI to build your grids. Searchable dropdowns for models/LoRAs, drag sliders for strength, and easy toggles!\n\n* **Powerful Iteration Inputting:** Use arrays in JSON to run \"each for each\" iterations to display vast combinations of outputs rapidly with ease! Using a \"\\*\" works for all samplers or all schedulers!\n\n* **Revise &amp; Generate:** Click any image in the grid to tweak its specific settings and re-run just that one instantly.\n* **Session Saving:** Save/Load test sessions to compare results later without re-generating.\n\n* **Smart Caching:** Skips model re-loads so parameter tweaks are nearly instant.\n\n* **Curation:** Mark \"bad\" images with an X, and it auto-generates a clean JSON of only your accepted configs to copy-paste back into your workflow.\n\n* **Lightning Fast:** Splits up and batches tasks to minimize unloading and reloading models!\n\n* **Auto LoRA Triggers:** Automatically fetches trigger words from CivitAI (via hash lookup) and appends them to your prompts. You can even filter out specific triggers you don't want.\n\n* **Massive Scale:** Supports folder expansion (test ALL models or LoRAs in any folder), multi-LoRA stacking, and handles grids of thousands of images with virtual scrolling.\n\n* **Non-Standard Support: Works out of the box with SD3, Flux, Z-Image, etc.\n\n* **Smart Caching:** Skips reloading models/LoRAs if they are shared between consecutive runs.\n\n* **Resumable:** Stop a run halfway? It detects existing images and resumes where you left off.\n\n* **JSON Export:** Automatically formats your \"Accepted\" and \"Favorite\" images into clean JSON to copy-paste back into your workflow.\n\nA ton more features listed and explained on the readme on GitHub!\n\n\n**Repo:** [https://github.com/JasonHoku/ComfyUI-Ultimate-Auto-Sampler-Config-Grid-Testing-Suite](https://github.com/JasonHoku/ComfyUI-Ultimate-Auto-Sampler-Config-Grid-Testing-Suite)\n\n## Here's some json_config examples you could plug in to instantly generate a variety of tests!\n\n# **Examples:**\n*This example generates 8 images (2 samplers × 2 schedulers × 2 steps × 1 cfg).*\n\n    [\n      {\n        \"sampler\": [\"euler\", \"dpmpp_2m\"],\n        \"scheduler\": [\"normal\", \"karras\"],\n        \"steps\": [20, 30],\n        \"cfg\": [7.0, 8.0],\n        \"lora\": \"None\",\n        \"str_model\": 1.0,\n        \"str_clip\": 1.0\n      }\n    ]\n\n\n\n## 🏆 Group 1: The \"Gold Standards\" (Reliable Realism)\n\n*Tests the 5 most reliable industry-standard combinations.* 5 samplers x 2 schedulers x 2 step settings x 2 cfgs = 40 images\n\n    [\n      {\n        \"sampler\": [\"dpmpp_2m\", \"dpmpp_2m_sde\", \"euler\", \"uni_pc\", \"heun\"],\n        \"scheduler\": [\"karras\", \"normal\"],\n        \"steps\": [25, 30],\n        \"cfg\": [6.0, 7.0],\n        \"lora\": \"None\",\n        \"str_model\": 1.0,\n        \"str_clip\": 1.0\n      }\n    ]\n    \n\n## 🎨 Group 2: Artistic &amp; Painterly\n\n*Tests 5 creative/soft combinations best for illustration and anime.* 5 samplers x 2 schedulers x 3 step settings x 3 cfgs = 90 images\n\n    [\n      {\n        \"sampler\": [\"euler_ancestral\", \"dpmpp_sde\", \"dpmpp_2s_ancestral\", \"restart\", \"lms\"],\n        \"scheduler\": [\"normal\", \"karras\"],\n        \"steps\": [20, 30, 40],\n        \"cfg\": [5.0, 6.0, 7.0],\n        \"lora\": \"None\",\n        \"str_model\": 1.0,\n        \"str_clip\": 1.0\n      }\n    ]\n    \n\n## ⚡ Group 3: Speed / Turbo / LCM\n\n*Tests 4 ultra-fast configs. (Note: Ensure you are using a Turbo/LCM capable model or LoRA).* 4 samplers x 3 schedulers x 4 step settings x 2 cfgs = 96 images\n\n    [\n      {\n        \"sampler\": [\"lcm\", \"euler\", \"dpmpp_sde\", \"euler_ancestral\"],\n        \"scheduler\": [\"simple\", \"sgm_uniform\", \"karras\"],\n        \"steps\": [4, 5, 6, 8],\n        \"cfg\": [1.0, 1.5],\n        \"lora\": \"None\",\n        \"str_model\": 1.0,\n        \"str_clip\": 1.0\n      }\n    ]\n    \n\n## 🦾 Group 4: Flux &amp; SD3 Specials\n\n*Tests 4 configs specifically tuned for newer Rectified Flow models like Flux and SD3.* 2 samplers x 3 schedulers x 3 step settings x 2 cfgs = 36 images\n\n    [\n      {\n        \"sampler\": [\"euler\", \"dpmpp_2m\"],\n        \"scheduler\": [\"simple\", \"beta\", \"normal\"],\n        \"steps\": [20, 25, 30],\n        \"cfg\": [1.0, 4.5],\n        \"lora\": \"None\",\n        \"str_model\": 1.0,\n        \"str_clip\": 1.0\n      }\n    ]\n    \n\n## 🧪 Group 5: Experimental &amp; Unique\n\n*Tests 6 weird/niche combinations for discovering unique textures.* 6 samplers x 4 schedulers x 5 step settings x 4 cfgs = 480 images\n\n    [\n      {\n        \"sampler\": [\"dpmpp_3m_sde\", \"ddim\", \"ipndm\", \"heunpp2\", \"dpm_2_ancestral\", \"euler\"],\n        \"scheduler\": [\"exponential\", \"normal\", \"karras\", \"beta\"],\n        \"steps\": [25, 30, 35, 40, 50],\n        \"cfg\": [4.5, 6.0, 7.0, 8.0],\n        \"lora\": \"None\",\n        \"str_model\": 1.0,\n        \"str_clip\": 1.0\n      }\n    ]\n    \n\n  I'd love to hear your feedback on it and if there's any other features that could be beneficial here!\n  ",
      "createdAt": 1771063578
    },
    {
      "id": "1sowq6v",
      "title": "Yeah it's expensive, but my OP-XY broke me out of a 4 year, grief-induced rut of not finishing songs, here's a demo called \"mourning brew\"",
      "subreddit": "synthesizers",
      "author": "sockman93",
      "upvotes": 1573,
      "commentCount": 245,
      "url": "https://v.redd.it/rdp9lesl2yvg1",
      "permalink": "/r/synthesizers/comments/1sowq6v/yeah_its_expensive_but_my_opxy_broke_me_out_of_a/",
      "selftext": "",
      "createdAt": 1776516425
    },
    {
      "id": "1qt2n3g",
      "title": "Sampler recommendations",
      "subreddit": "TechnoProduction",
      "author": "baglizard",
      "upvotes": 22,
      "commentCount": 36,
      "url": "https://i.redd.it/8ro1rr2arwgg1.jpeg",
      "permalink": "/r/TechnoProduction/comments/1qt2n3g/sampler_recommendations/",
      "selftext": "I’m aware of how unhinged this is lol, currently building a desk top so I’m working on the floor rn.\n\nI make a lot of ambient techno.\n\nI want a solid sampler mainly for me to sync in samples I take from cassettes/ records, what samplers do you guys recommend?",
      "createdAt": 1769962514
    },
    {
      "id": "1n5k6h0",
      "title": "What's the best sampler for me?",
      "subreddit": "makinghiphop",
      "author": "okayv",
      "upvotes": 7,
      "commentCount": 37,
      "url": "https://www.reddit.com/r/makinghiphop/comments/1n5k6h0/whats_the_best_sampler_for_me/",
      "permalink": "/r/makinghiphop/comments/1n5k6h0/whats_the_best_sampler_for_me/",
      "selftext": "Hello guys, I am having a bit of trouble picking a sampler/groovebox to buy. \n\nI have been making music for 1 and a half years. Started out on Reaper with a mouse and keyboard but shortly bought the Akai MPK Mini Plus cause I wanted that tactile feel of hitting the pads and playing the keys. I also used its sequencer a lot early on, even though it's limited it was a lot of fun to play around with. At that time I also switched from Reaper to the MPC Beats software so I've gotten used to the MPC workflow. \n\nHowever, lately I've felt that making beats this way has made me a bit uninspired since I end using the same process every time and I think part of that is due to how the modern MPC works in general. I've started making more beats on my phone now, using the Koala app, and they usually end up sounding better, more creative and more real if that makes sense. \n\nI've always wanted a sampler and now it's time to make a decision. I thought I would just get the MPC One Plus but now I'm reconsidering due to the reasons I stated before and the MPC 3 update which will just make the software even more DAW-like, something I want to get away from. \n\nSo my options for my budget right now are pretty much; the SP-404 mkII or the MPC 1000. Maybe even the MPC 500 combined with the 404 or just by itself. What's your opinion?",
      "createdAt": 1756718997
    },
    {
      "id": "1tc5dxi",
      "title": "What’s a simple piece of advice that massively improved your sound?",
      "subreddit": "musicproduction",
      "author": "SheWantMyDinero",
      "upvotes": 114,
      "commentCount": 161,
      "url": "https://www.reddit.com/r/musicproduction/comments/1tc5dxi/whats_a_simple_piece_of_advice_that_massively/",
      "permalink": "/r/musicproduction/comments/1tc5dxi/whats_a_simple_piece_of_advice_that_massively/",
      "selftext": "For me it was to largely avoid high passing whenever possible and to make sure the reverb’s pre-delay and decay times are in sync with the beat.",
      "createdAt": 1778690918
    },
    {
      "id": "1p92xe7",
      "title": "You wanted Disclosure.... I am a whistleblower recently \"retired\" from the inside. And you're only getting part of the truth.",
      "subreddit": "UFOs",
      "author": "rhea-15510",
      "upvotes": 9239,
      "commentCount": 3728,
      "url": "https://www.reddit.com/r/UFOs/comments/1p92xe7/you_wanted_disclosure_i_am_a_whistleblower/",
      "permalink": "/r/UFOs/comments/1p92xe7/you_wanted_disclosure_i_am_a_whistleblower/",
      "selftext": "Hi. So I heard y'all want disclosure? Alright, hope you have time for this because there's a LOT. Grab a coffee or maybe get comfy with a pillow somewhere.\n\nI've been watching the news and hearing a lot of things I know to be true shockingly being talked about openly by some higher ups in a documentary so I figured what the hell?\n\nYou can call me Rhea. Not my real name obviously, but it will do. \n\nA little about me... I spent about eight years in the military to pay for college and then another decade plus in a part of the US intelligence component that does not officially exist. On paper I worked for a boring sounding office in a department most people have never heard of. In reality it was a compartment inside a compartment where the odd stuff of a certain nature got routed.\n\nMy actual specialty is electro-optics. Lasers, sensors, EO imaging systems, the math and hardware behind how we detect things at a distance and, in some cases, put energy on them. That is what I trained in, what I did most of my serious work on once I was off the deployment treadmill. So when I say I know something about directed energy weapons and weird sensor returns, that's not \"I heard this from a friend of a friend\". That was my day job. Most of my career was boring in the way dangerous jobs are boring. Long days in windowless rooms. Iraq and Afghanistan in the early years, doing the usual mix of SIGINT and HUMINT support. Phone records, pattern-of-life workups, building target packets on people who’d never know my name but might notice a drone overhead later. After I got out of uniform I slid over to contractor work, then got pulled into the permanent government side.\n\nFor a long time my world was very normal: counterterrorism, sanctions evasion, shady cargo going through weird ports, stuff like that. After that, foreign missile tests and what you have probably seen described publicly as space domain awareness. Basically, watching dots move around the sky and trying to decide whose dots they were and what they were doing.\n\nThe weird part started when I was detailed to a small interagency working group looking at what was called \"anomalous aerospace and undersea systems\". Translation: things detected and showing up on sensors that did not match any known platform, did not behave like clutter, and did not go away when you changed radar modes or swapped optical systems. I was there because I understood both sides of the equation: the physics of the sensors and the intelligence context. You get taught very quickly to treat anything unexplained as a glitch, a calibration issue, operator error, software artifacts, anything that keeps your world tidy. You get used to hearing “weird glitch” as a catch-all. Except after a while you notice some of those “glitches” kept showing up, across different systems, different countries, decades apart. Same behaviors. Same basic locations. Same signature that never quite fits. At some point you either admit there is a real pattern or you drive yourself crazy trying not to see it. If you are useful and you start asking the wrong questions for long enough, someone eventually pulls you aside, takes you to a SCIF, takes your phone, has you sign your life away again, and shows you the next layer of the onion. \n\nThis onion goes so deep I doubt that even after years of briefings I've been exposed to anything below a few layers. Even still most of this is purposely kept off NIPR and JWICS and is done in person.\n\nThat is where I learned about most of what you're interested in here and what seems to be bubbling to the surface in the news lately. That when I learned about what we call The Council. Yes aliens, and I suspect you're not likely to see a lot of what I know mentioned even by some who know it who have begun speaking out for reasons I'll get into later. \n\nI've never met them face to face. Everything I know about them is from briefings, documents, and one secure video session that I honestly wish I had skipped. But it lines up with too many independent data points to just shrug off as somebody’s pet theory.\n\nThe basic story is this. Earth was noticed roughly 2 billion years ago, long before anything walked around on land. Not because we’re special, but because we tripped a sensor. Or rather life tripped their sensors. You see, The Council is not a single species. It is a collective of several advanced interstellar maybe even interdimensional civilizations that run long term surveys of stars and planets the way we run spy satellites. Huge distributed arrays of instruments, working together, watching thousands of star systems at once, for millions of years at a time. Their gear probably makes the James Webb telescope look like a kid's backyard telescope.\n\nAbout 2 billion years ago those instruments picked up biosignatures here, chemical fingerprints in the atmosphere that meant something was alive here. Atmospheric composition like free oxygen and methane, spectral fingerprints, chemical disequilibria that scream “there’s metabolism happening down there!\" you know, the basics. At that point Earth went into a database as “interesting, revisit later”.\n\nStandard procedure for them when a world looks promising is pretty boring from their point of view. They send automated probes. Not big crewed ships like you see in sci-fi movies, just small, tough, very smart machines. Those probes come in, mostly target the oceans, and set up self replicating facilities on the seafloor. Those facilities use local materials to build more facilities, more probes, craft that can operate underwater, in the air, in near space, and eventually avatars that can interact with whatever life evolves. These biological or rather, biomechanical avatars are what some people who claim to have been abducted have likely experienced.  Though they do have what we would call ASI, these beings are not gods, they are technology and they aren't perfect, they make mistakes, glitch out, etc. \n\nThe reason they base all of that underwater for a simple reason. The bottom of an ocean does not care about ice ages, political empires, climate swings or wars. Temperatures and pressures change slowly over what long periods of time. Its a fairly stable environment and for much of human history has been mostly inacessible. Speaking of time, we Earth humans tend to think in terms of nothing longer than the current human lifespan. And when pondering non-human intelligence we like to think in terms of deep space, distance and light years but we seldom consider the lifespan and concept of time for a post-biological species could be quite different than outs. Only our most astute thinkers in the realms of geology, palentology and cosmology think in terms of millions or billions of years. Geologic epochs, cosmological history. That is childsplay for The Council which has a different concept of time, more concerned with deep time, millions of years at a stretch. As such their infrastructure is designed for that. \n\nSo yes, a lot of the TMOs (transmedium objects) and impossible accelerations you have heard about are just their hardware doing its job. Maintenance, observation, sampling. Nothing heroic. The warp bubble/Alcubierre effect was probably mastered by them before our solar system even existed. It's old tech for them. Kinda like the wheel is for us. Also, no, we are not the center of anyone’s universe. There are about a billion planets in our galaxy that are more or less like Earth. Some just have microbes. Some have more complex life. A smaller subset of those have or once had civilizations. We are just one more entry, a fairly recent one in cosmological terms, in a very large survey.\n\nOnce early humans started doing interesting things, we moved from “planet with life” to “planet with potential”. They have watched this same story unfold in slightly different ways around a thousand times from what I understand. Chemistry leads to biology, biology creates technology. Tool use, language, agriculture, cities, industry, energy, space travel. Somewhere in there you always hit the same fork. Either the species figures out how not to blow itself to pieces with the energy densities it increasingly has access to such as nuclear fission, nuclear fusion, anti-matter and more exotic matter/energy, or it wipes itself out.\n\nOur situation worried them. We are a little paradox: extremely good at cooperation and also extremely good at organized violence. Our aggression stood out. Cooperation plus violence isn’t unique, but we’re very, very good at both. And once you get to things like nuclear power, that combo tends to end very badly. They'd seen plenty of variations of that play out over at least a few billion years.\n\nAbout 10,000 years ago our trajectory towards that became clear and there was a major argument inside the Council about what, if anything, to do with us. One side said the odds favored self destruction once we discovered and weaponized atomic level technologies. The other side argued we were worth saving or at least worth understanding better. The compromise was an experiment. One which has ramifications as to why all of this has been hidden for so long.\n\nRoughly 65,000 humans were removed from Earth and relocated to what is basically a preserve on a planet around the star you know as 82 Eridani. Internally we called those people Erids. That star is in our catalogs if you feel like looking it up, but the details of the target planet are not public for obvious reasons.\n\nThe Erids were started in a kind of controlled paradise. Their world has large dispenser systems that can produce whatever basic material needs they have. Food, clothing, tools, building materials, entire strucures for habitation. Think Star Trek replicators scaled up and wired into the environment. In that setup nobody starves, nobody is homeless in the way we understand it, nobody spends their life chasing money just to meet needs. This was just the Erids natural reality.\n\nThe point from The Council's view was to remove material scarcity from the equation and see what humans do and achieve when they are not spending most of their energy bashing each other over the head over resources. Meanwhile, the rest of us stayed here on the control planet, dealing with scarcity, ownership, money, hoarding, and the rise of socio-political systems based on scarcity: all of the things that define Earth civilization.\n\nThe result, according to what we were briefed, is that the Erids are now around 5,000 years ahead of us technologically, averaged out. Same species, same basic biology, same starting point, completely different trajectory because of conditions. Nature vs nurture on a cosmic scale. For most of their history they Erids thought they were native to that world. They only found out the truth roughly a century ago in our time. They learned that they were uplifted, that their ancestors were taken from Earth, that they have cousins here.\n\nOnce they knew that, some of them started coming back to visit the original branch. This is where their history intersects the some of the UFO stories you know. The “aliens” that look almost exactly human are just that. Human. They are not hybrids, not clones, not secretly angels or demons. They are Erids, born around another star, showing up here after being given a 10,000 year head start. They have in some cases met with leaders of certain countries and at least two U.N. Secretary Generals (both deceased).\n\nNow we get to why this has been buried for 80 some years.\n\nYou have to think like a senior US official in the 1940s and 1950s. World War II has just ended, the Cold War is starting, everything is viewed through capitalism versus communism. Then someone puts a briefing in front of you that says, in essence, there is a group of humans living on another world who have no money, no private ownership in the way we structure it, automatic systems that meet their basic needs, and in that environment they advanced thousands of years faster than we have. The men who built what we now call the legacy program in the US that sounded less like “interesting anthropological data” and more like “a walking, talking advertisement for space communism.” It looked like proof that communism works better than the system they were trying to defend. That and the ramifications of what could happen if THAT ever got out terrified them more than the existence of aliens did, though to be fair they plenty had their worldview rocked by the latter too.\n\nSo the core of the cover up has never just been “aliens” or even their technologies. It has been the systemic implications. The idea that scarcity and ownership are not hard coded into reality, that they are one possible way to run a society, and maybe not the optimal one. That was seen as an existential political threat in the 1940s and 1950s and some of the people who grew up in that mindset are still steering parts of the program today. \n\nNow add in the famous crash-retrieval incidents. Roswell '47, Kecksburg '65, a handful of other retrievals around the U.S. and around the world. What we were told is that most of those were not accidents. They were tests and gifts. The Council, with Erid input, allowed certain craft and systems to fall into human hands in a controlled way. Enough intact technology that a very motivated and capable society could learn from it, not enough that it would instantly rewrite everything.\n\n In fact the Kecksburg landing, it wasn't called a crash internally, was a direct result of a meeting and gift agreement made at Holloman AFB the year prior. The idea was to see who did what with it. Who could figure it out, who kept it secret, who tried to share, who tried to weaponize it, who panicked. Based on those results, the plan was to pick one primary human partner to act as the main interface for full Council contact and to begin a managed process of reunifying Earth humans with the Erids and introducing us to the wider community.\n\nYou can argue whether that is a good way to do it. I am just telling you that is the framework I saw laid out.\n\nIn the 1980s-90s during a brief period when the Cold War ended there was a push to finally disclose much of this. This was initially proposed at meeting between then U.S. President Ronald Reagan and then Soviet leader Mikhail Gorbachev at a summit in Reykjavik, Iceland in 1986. Also discussed was getting rid of nuclear weapons as had been urged by The Council. In the end it was decided to wait. There were two more U.S. pushes for disclosure between then and the 2017 New York Times article. One during the Clinton administration and another during the transition between the Obama and first Trump presidency.\n\nNow for the part that put a clock on all of this stuff you've been hearing about 2027 etc....\n\nAbout three years ago, a species that is hostile to the Council found out about the Earth project. They are not part of the collective. They resent the way the Council handles in younger civilizations as they themselves felt victimized by the Council. They also resent the credit the Council gets for “successful” cases. I have heard them described as the jealous neighbors who would rather break your toys than watch you win. \n\nYes, we sometimes joke about this stuff because again, it's the only way to stay sane with this everyday knowledge and integrate it into your civilian life of thanksgiving dinner, xmas shopping, taking the kids to soccer practice etc.  Just as an aside, ever consider how two of the biggest holidays of they year involve gluttony (Thanksgiving) and overconsumption (Black Friday)? When you have the knowledge many have within the program stuff that is taken for granted seems really weird and a symptom of the now, forced scarcity of our current system.\n\nAnyway back to the aliens... The hostile group I mentioned decided to spoil the experiment.\n\nThis species is ahead of us technologically but far behind the Council. Though they also inhabit a relatively nearby star cosmologically speaking, their travel is slower, less elegant and has to take place in stages, think of it as space \"island hopping\" which is why the lead time is so long. You probably want to know what they look like. Physically, based on the descriptions we saw, they are about five feet tall, segmented bodies, multiple limbs, basically ant like in overall form. Nothing subtle or humanoid about them.\n\nThey launched an expedition toward Earth with the stated goal of making a mess. Cause chaos here, damage the experiment, and embarrass the Council by showing they cannot protect their own projects due to internal disagreements. Basically exploiting internal fissures, turning small cracks of understanding in The Council into canyons, thus destroying it. That's their hope at least. The transit time means for us they are expected to arrive in roughly two years from now, the 2027 holiday present NO ONE asked for.\n\nThat news triggered a major debate within the Council. One group said, the rules say non interference, we watch and record what happens, even if it is ugly, as we had done in the past. The other group said, we effectively created this situation by tagging and monitoring this world, we have a moral obligation not to just watch a civilization we have been studying get smashed by somebody else’s grudge. If the Council showed up in force it would not be much of a fight. Their technology relative to the ant species is like a modern carrier group versus skilled archers on sailboats. The whole thing would be over quickly and it would also completely blow the point of letting a young species find its own way. It would also be a tremendous blow to the human ego which The Council is well aware of.\n\nSo they arrived at a compromise. No direct Council fleets defending Earth. No obvious intervention. Instead, they would quietly arm us.\n\nWhat they chose to give us are things they roughly call scalar phase weapons. Our vocabulary is not great here. They are not just high power lasers. They interact with fields we do not fully understand or really have names for yet, shift phases, dump huge amounts of energy from the vacuum into very specific volumes of spacetime without a conventional bright beam or explosion. Compared to our current directed energy weapons, they are an enormous leap. As someone who spent years working with lasers and optics systems, I can tell you they sit so far off our current tech tree that if you saw the damage assessments from a pulse without context you would think they were misprints. But compared to Council weapons, they are nerf guns, training wheels per-se.\n\nAnyway, that decision set off another big argument, both among them and among us. The obvious concern was simple. Once the external threat is gone, what stops us from turning these things on each other the same way we took nuclear power and turned it into thousands of warheads aimed at our own cities?\n\nOn the US side there were people saying exactly that. And some members of The Council argued that if we on Earth roll out scalar systems across arsenals, the first real test after the bugs are gone will likely be some crisis where two human governments start lighting each other up with technology they we do not fully understand.\n\nThe counter argument, which won, was that species level survival has to come first. If humanity gets wiped out by someone else’s petty feud, then the entire debate is academic. Also, if humans fight this off themselves instead of watching the Council show up and save the day, they will meet the wider community as people who actually did something, not as rescued primitives. Human ego intact. And kill switch if you will, has been built into the tech to disable it after the conflict which The Council sees us winning. If we then decide to use these weapons against each other they'll simply be disabled until we humans have learned enough to disable the kill-switch which could be thousands of years from now for all I know.\n\nSo against a lot of internal resistance, the Council has been quietly providing scalar phase systems to several blocs, not just the US. The list I saw included the United States, China, the European Union through specific channels, Russia, and Brazil. Those systems are being integrated into space platforms, aircraft, and undersea assets. Testing is happening in remote places and high altitudes, often disguised as other things. Most of the people physically working on it think it is an advanced homegrown black program. Only a very small circle in each capital sees the full context. I got to see pieces of that picture shortly before I was pushed into “retirement”, which is a polite way of saying I stopped being convenient. That is as specific as I am willing to get.\n\nThere is one more reason I am writing this now, after pondering it for a long time, and it is more personal than the two year clock.\n\nA friend of mine, someone I worked closely with inside the program, another EO specialist, had been talking quietly years ago about going to Congress. Not with everything, they were not suicidal. Just enough to force a real closed door hearing in the Senate, get the true nature of certain SAPs acknowledged on paper, make it harder to bury the whole subject under jokes and career threats.\n\nOver as year ago I got word that they died. The official explanation has been vague and unsatisfying. “Medical complications” on a trip to a black site in the Indian Ocean. Those medical complications do not match what I know about their health, then it became \"an accident at home” with no details anyone will put in writing. People who would normally be candid went very quiet very fast. Maybe it was just bad luck. People do die suddenly. But given the threats which are known about within certain IC sectors when one is associated with this subject, I don't know for sure. What I do know is that the last long conversation I had with them was about whether it was worth trying to talk to certain congressional staffers for a certain Senator.\n\nAfter hearing recent news confirming publicly much of what I know to be true privately I stopped telling myself I would wait and see how things played out. Life is short.\n\nSo here we are. Some stranger on the internet telling you an unbelievable story you are free not to believe.\n\nWith roughly two years on the clock and the current rate of leaks and “whistleblowers” and half disclosures, it is very unlikely they keep all of this under wraps until the first time something openly not from here appears in our sky or our orbit. At some point before that happens, at least one major government, maybe more, is going to go public in a controlled way. My guess would be China or the US, but it could be one of the others on that scalar weapon list. You will likely get a very carefully worded announcement about unidentified aerial phenomena, about contact with “non human intelligences”, about new defensive technologies and unprecedented international cooperation. It will be designed to manage panic and control the story.\n\nWhat you probably will not hear in the first round of briefings is the part about the Erids, the economic implications of their society's existence, the billion other habitable planets, the undersea infrastructure that has been here longer than we have had bones. You will not see anyone step up to a podium and say “oh by the way, there is a branch of humanity that grew up without the idea of money and scarcity ten thousand years ago and advanced five millennia past us”.\n\nThat is why I am dumping this here, where people can ignore it, laugh at it, or save it and see how it ages.\n\nLike I said, do not have to believe me. I'm not here to sell a book, go on podcasts, be on Tv or do UFO lectures/ Treat this as fiction if that makes you more comfortable. What I am really trying to do is get you to think past the kiddie pool questions. “Are UFOs real” \"Are the NHI good or evil?\" is not the interesting part. The far more interesting questions are what happens to this planet once everyone knows we are being watched, that we have cousins around another star, that some of the basic assumptions we built our societies around were just one option, not a fundamental law of nature.\n\nIf in a year or two you start hearing officials talk about “our cousins among the stars” or “civilizations far older than ours” and “new non kinetic systems” and “shared planetary defense”, remember this post and see how well it fits. Look, the bugs are coming either way. The Council is not going to save us directly. They already handed out the tools and they are watching to see what we do with them.\n\nThe part that is still up to us is what kind of world we build if we get through it. Will we all go back to work and beat each other over the head with really advanced sticks or do we achieve a more enlightened potential?\n\nThat is all I have.\n\nRhea",
      "createdAt": 1764356158
    },
    {
      "id": "1qvq48j",
      "title": "Best Sampler Dish",
      "subreddit": "Atlanta",
      "author": "Far-Picture-8158",
      "upvotes": 6,
      "commentCount": 5,
      "url": "https://www.reddit.com/r/Atlanta/comments/1qvq48j/best_sampler_dish/",
      "permalink": "/r/Atlanta/comments/1qvq48j/best_sampler_dish/",
      "selftext": "My husband and I are looking for a place to eat for our one-year wedding anniversary. We love trying new dishes and would appreciate any recommendations for restaurants with a great “taste of…” or tasting-style dish. TIA!",
      "createdAt": 1770215604
    },
    {
      "id": "1sa3uz1",
      "title": "Steam Hardware &amp; Software Survey: March 2026",
      "subreddit": "nvidia",
      "author": "Nestledrink",
      "upvotes": 132,
      "commentCount": 160,
      "url": "https://www.reddit.com/r/nvidia/comments/1sa3uz1/steam_hardware_software_survey_march_2026/",
      "permalink": "/r/nvidia/comments/1sa3uz1/steam_hardware_software_survey_march_2026/",
      "selftext": "**Link Here**: [https://store.steampowered.com/hwsurvey/videocard/](https://store.steampowered.com/hwsurvey/videocard/)\n\nNVIDIA RTX 50 Series Desktop/Laptop Cards\n\n* RTX 5070 = 2.87% (-6.55% vs February 2026)\n* RTX 5060 = 2.42% (-4.30%)\n* RTX 5060 Laptop = 1.81% (+1.23%)\n* RTX 5060 Ti = 1.67% (-2.61%)\n* RTX 5070 Ti = 1.55% (+0.28%)\n* RTX 5080 = 1.34% (-0.32%)\n* RTX 5070 Laptop = 0.45% (**New**)\n* RTX 5090 = 0.42% (+0.17%)\n* RTX 5070 Ti Laptop = 0.31% (+0.12%)\n* RTX 5050 Laptop = 0.24% (**New**)\n\nAMD RX 90 Series Desktop/Laptop Cards\n\n* RX 9070 = 0.16% (Was in January data at 0.16%. Moved off the list in February and back with the same share in March)",
      "createdAt": 1775093690
    },
    {
      "id": "1nr41rx",
      "title": "Anyone recommend this brand or this sampler bundle at $88?",
      "subreddit": "cigar_refuge",
      "author": "Sf15340587",
      "upvotes": 51,
      "commentCount": 19,
      "url": "https://i.redd.it/4dcz2dl20jrf1.jpeg",
      "permalink": "/r/cigar_refuge/comments/1nr41rx/anyone_recommend_this_brand_or_this_sampler/",
      "selftext": "",
      "createdAt": 1758899774
    },
    {
      "id": "1lhb6ej",
      "title": "Megathread: US confirms strikes on Iran, 6/21",
      "subreddit": "army",
      "author": "Kinmuan",
      "upvotes": 2955,
      "commentCount": 1807,
      "url": "https://www.reddit.com/r/army/comments/1lhb6ej/megathread_us_confirms_strikes_on_iran_621/",
      "permalink": "/r/army/comments/1lhb6ej/megathread_us_confirms_strikes_on_iran_621/",
      "selftext": "After days of speculation, including public tracking of military air assets, the US has attacked Iranian nuclear sites, according to POTUS.\n\n[NBC Live Coverage](https://www.nbcnews.com/world/middle-east/live-blog/israel-iran-conflict-rcna214241)\n\n[CNN Live Coverage](https://www.nbcnews.com/world/middle-east/live-blog/israel-iran-conflict-rcna214241)\n\n['Trump says US attacked three Iran nuclear sites'](https://www.cnbc.com/2025/06/21/trump-israel-iran-conflict.html)\n\n[POTUS to address nation at 10pm tonight](https://i.imgur.com/xyRVZSE.png)\n\n[POTUS indicates that Fordow has been destroyed, says 'NOW IS THE TIME FOR PEACE'](https://i.imgur.com/wR70zut.png)\n\n[Here's some online Persian Language Guides](https://persianlanguageonline.com/learn/all-courses/)\n\n**Highlights from 10pm Statement**\n\n* Well it's 10:01, so I guess we're not starting on time\n* Massive precision strikes on 3 major Iran nuclear sites\n* Objective was to destroy their uranium enrichment; POTUS says strikes were a spectacular military success\n* These sites were \"completely obliterated\"\n* If they don't surrender, future attacks will be 'far greater' and 'easier'\n* Mentions the strike that killed Soleimani\n* Thanks Netanyahu, thanks the IDF\n* Thanks to the great American patriots who flew the mission\n* Congratulations to CJCS, a spectacular general\n* There will be peace, or there will be tragedy for Iran\n* No military could have done what we did tonight\n* CJCS and Hegseth to brief at the Pentagon 08 tomorrow.\n* We love you God, God Bless the Middle East, God Bless Israel, God Bless the US\n\n**Highlights from SECDEF CJCS**\n\n* Midnight Hammer was op name\n* Highly classified, very few people in Washington knew\n* B2 movement into pacific was a decoy\n* Other B2 went east, refueling, to make it to target\n* regional sub launched tomahawaks as well\n* No shots were fired at the US group\n* 14 MOPs dropped against 2 sites; https://en.m.wikipedia.org/wiki/GBU-57A/B_MOP\n* no shots fired on way out; no Iranian airforce launch and no indication Iran anti air saw them\n* Largest B2 operational strike in history \n* Went from planning to reality in a few weeks\n* highlighted the opsec that went into this\n* ended on a question about new intelligence or where any new intelligence came from; secdef was basically like nothing new potus just looked at the info and decided this was needed, then they left.\n\n[USA Today discussion of 'what's next'](https://www.usatoday.com/story/news/politics/2025/06/22/iran-retaliation-us-strikes-trump-bombs/84304863007/)\n\n[UN Security Council Emergency Meeting, 6/22, via PBS on YouTube](https://www.youtube.com/watch?v=PCcW1Sb5bsM)",
      "createdAt": 1750552604
    },
    {
      "id": "1s1p4cw",
      "title": "Best Sampler Blind Buys?",
      "subreddit": "Fragrances",
      "author": "LouieLongBoi",
      "upvotes": 6,
      "commentCount": 17,
      "url": "https://i.redd.it/ee2rbr288uqg1.jpeg",
      "permalink": "/r/Fragrances/comments/1s1p4cw/best_sampler_blind_buys/",
      "selftext": "",
      "createdAt": 1774290429
    },
    {
      "id": "1sa6reh",
      "title": "Steam Hardware &amp; Software Survey: March 2026",
      "subreddit": "hardware",
      "author": "JohnSteveRom2077",
      "upvotes": 122,
      "commentCount": 186,
      "url": "https://store.steampowered.com/hwsurvey/videocard/",
      "permalink": "/r/hardware/comments/1sa6reh/steam_hardware_software_survey_march_2026/",
      "selftext": "NVIDIA RTX 50 Series Desktop/Laptop Cards\n\n* RTX 5070 = 2.87% (-6.55% vs February 2026)\n* RTX 5060 = 2.42% (-4.30%)\n* RTX 5060 Laptop = 1.81% (+1.23%)\n* RTX 5060 Ti = 1.67% (-2.61%)\n* RTX 5070 Ti = 1.55% (+0.28%)\n* RTX 5080 = 1.34% (-0.32%)\n* RTX 5070 Laptop = 0.45% (New)\n* RTX 5090 = 0.42% (+0.17%)\n* RTX 5070 Ti Laptop = 0.31% (+0.12%)\n* RTX 5050 Laptop = 0.24% (New)\n\nAMD RX 90 Series Desktop/Laptop Cards\n\n* RX 9070 = 0.16% (Was in January data at 0.16%. Moved off the list in February and back with the same share in March)",
      "createdAt": 1775101764
    },
    {
      "id": "1sowwfe",
      "title": "My op-xy broke me out of a 4 year, grief-induced rut of not finishing songs, here's a demo called \"mourning brew\"",
      "subreddit": "teenageengineering",
      "author": "sockman93",
      "upvotes": 372,
      "commentCount": 52,
      "url": "https://v.redd.it/gmzze3rh3yvg1",
      "permalink": "/r/teenageengineering/comments/1sowwfe/my_opxy_broke_me_out_of_a_4_year_griefinduced_rut/",
      "selftext": "4 years ago my partner of nearly a decade passed and with him, I lost my ability to finish songs. I used to make everything on the Synthstrom Deluge and would run all my demos by him and without him, nothing sounded right anymore. I spent years trying to figure out if a new device would inspire me and help me finish things again and it wasn't until I got the op-xy that everything finally clicked again.\n\nThis song was entirely made on the op-xy, recorded out into a tp-7, then post-processed the stereo recording in ableton with ozone with some tape emulation.\n\nI've been a TE lurker/commenter for a couple years now and haven't shared any of my stuff made with TE gear til now so if ya'll like it, try to nudge me to get it ready for release cause it's been a minute and I need some encouragement haha\n\nupdate: thank ya’ll for everything. i just uploaded the song to bandcamp so if you like it and wanna listen at your leisure, here ya go https://sckdrwr.bandcamp.com/track/mo-rning-brew ",
      "createdAt": 1776516887
    },
    {
      "id": "1tc43l6",
      "title": "OPINION: For most styles of music, vocal tracks should be compressed surprisingly hard.",
      "subreddit": "audioengineering",
      "author": "scrapeape",
      "upvotes": 108,
      "commentCount": 157,
      "url": "https://www.reddit.com/r/audioengineering/comments/1tc43l6/opinion_for_most_styles_of_music_vocal_tracks/",
      "permalink": "/r/audioengineering/comments/1tc43l6/opinion_for_most_styles_of_music_vocal_tracks/",
      "selftext": "It evens out any inconsistencies in volume/\"vocal power\" and ends up sounding flattering. As long as you're EQing before the compressor, any \"pumping\" or artifacts shouldn't be audible in the mix.\n\n(And then you can throw on the perfect eventide-style supershort chorus/delay effect emulator plugin, which I can't find... lemme know if you've got a fave.)",
      "createdAt": 1778688300
    },
    {
      "id": "1tchd39",
      "title": "My somewhat humble bedroom studio",
      "subreddit": "homestudios",
      "author": "tim-allen-jackson-5",
      "upvotes": 151,
      "commentCount": 14,
      "url": "https://i.redd.it/dfbc4v84uz0h1.jpeg",
      "permalink": "/r/homestudios/comments/1tchd39/my_somewhat_humble_bedroom_studio/",
      "selftext": "",
      "createdAt": 1778716751
    }
  ],
  "report": {
    "executiveSummary": "Reddit discussions about 'best sampler' span multiple domains including music production hardware, AI image generation software, and food. The most relevant content focuses on hardware samplers like the KO2 and various AI image generation samplers/schedulers.",
    "themes": [
      {
        "title": "Music Production Hardware",
        "description": "Users discussing hardware samplers like the KO2 (praised for recent updates adding sidechaining and voices), with recommendations for samplers in techno production and hip-hop making. The OP-XY is also mentioned as helping overcome creative blocks."
      },
      {
        "title": "AI Image Generation Samplers",
        "description": "Technical discussions about optimal sampler/scheduler combinations for various AI models (Flux Kontext, Wan 2.2, StableDiffusion). Users share specific recommendations like 'Deis + beta57' and debate between euler, dpm, and other sampling methods."
      },
      {
        "title": "Sampler Testing and Optimization",
        "description": "Users expressing frustration with trial-and-error approaches to finding optimal settings, with some creating custom tools and workflows for systematic testing of different sampler configurations."
      },
      {
        "title": "Food Samplers and Variety Platters",
        "description": "Discussion of food sampler platters, particularly a Thanksgiving pie sampler that combines multiple pie flavors in one dish, praised for offering variety without excess quantity."
      }
    ],
    "sentiment": {
      "overall": "mixed",
      "rationale": "Positive enthusiasm for specific products and solutions, but underlying frustration with the complexity of choosing optimal settings across different domains."
    },
    "notableQuotes": [
      {
        "text": "After latest KO2 update, it feels like it's gotta be the best sampler in its price range. Crazy part is it getting sidechaining before the SP404.",
        "subreddit": "synthesizers",
        "url": "https://www.reddit.com/r/synthesizers/comments/1kwyj2b/after_latest_ko2_update_it_feels_like_its_gotta/"
      },
      {
        "text": "Check Deis + beta57, 20-25 steps, i like the quality using Deis! If you dont have beta57 need install a custom node",
        "subreddit": "comfyui",
        "url": "https://www.reddit.com/r/comfyui/comments/1lry98v/flux_kontext_best_samplerscheduler/"
      },
      {
        "text": "I got tired of guessing which Model/Prompt/Sampler/Scheduler/Lora/Step/CFG combo work best, so I built some custom nodes for testing and viewing results inside ComfyUI!",
        "subreddit": "comfyui",
        "url": "https://www.reddit.com/r/comfyui/comments/1r4gzsk/i_got_tired_of_guessing_which/"
      },
      {
        "text": "Omg I was just saying last week that I need someone to offer a Franken-pie like this. It's just my husband and I so 4 pies is too much pie but I also like a variety of pies for thanksgiving.",
        "subreddit": "Baking",
        "url": "https://www.reddit.com/r/Baking/comments/1p6d4wk/the_best_seller_from_my_pie_pop_up_the/"
      }
    ],
    "topPosts": [
      {
        "title": "After latest KO2 update, it feels like it's gotta be the best sampler in its price range.",
        "subreddit": "synthesizers",
        "upvotes": 564,
        "commentCount": 182,
        "url": "https://www.reddit.com/r/synthesizers/comments/1kwyj2b/after_latest_ko2_update_it_feels_like_its_gotta/"
      },
      {
        "title": "I got tired of guessing which Model/Prompt/Sampler/Scheduler/Lora/Step/CFG combo work best, so I built some custom nodes for testing and viewing results inside ComfyUI! Feedback appreciated!",
        "subreddit": "comfyui",
        "upvotes": 303,
        "commentCount": 50,
        "url": "https://www.reddit.com/r/comfyui/comments/1r4gzsk/i_got_tired_of_guessing_which/"
      },
      {
        "title": "Debate! Best Wan 2.2 t2v settings (steps, sampler, cfg, speed loras, etc.)",
        "subreddit": "StableDiffusion",
        "upvotes": 254,
        "commentCount": 169,
        "url": "https://www.reddit.com/r/StableDiffusion/comments/1mfzvl5/debate_best_wan_22_t2v_settings_steps_sampler_cfg/"
      },
      {
        "title": "Who is the best Sampler?",
        "subreddit": "sampling",
        "upvotes": 16,
        "commentCount": 63,
        "url": "https://www.reddit.com/r/sampling/comments/1npmbqz/who_is_the_best_sampler/"
      },
      {
        "title": "Flux Kontext Best Sampler/Scheduler?",
        "subreddit": "comfyui",
        "upvotes": 35,
        "commentCount": 16,
        "url": "https://www.reddit.com/r/comfyui/comments/1lry98v/flux_kontext_best_samplerscheduler/"
      },
      {
        "title": "Best Sampler for Wan2.2 Text-to-Image?",
        "subreddit": "StableDiffusion",
        "upvotes": 21,
        "commentCount": 27,
        "url": "https://www.reddit.com/r/StableDiffusion/comments/1mqtn9b/best_sampler_for_wan22_texttoimage/"
      },
      {
        "title": "For you all, what's the best sampler and scheduler combination?",
        "subreddit": "ZImageAI",
        "upvotes": 20,
        "commentCount": 13,
        "url": "https://www.reddit.com/r/ZImageAI/comments/1qe39bj/for_you_all_whats_the_best_sampler_and_scheduler/"
      },
      {
        "title": "Sampler recommendations",
        "subreddit": "TechnoProduction",
        "upvotes": 22,
        "commentCount": 36,
        "url": "https://www.reddit.com/r/TechnoProduction/comments/1qt2n3g/sampler_recommendations/"
      },
      {
        "title": "Is there any better way to find the best sampler and scheduler?",
        "subreddit": "comfyui",
        "upvotes": 15,
        "commentCount": 33,
        "url": "https://www.reddit.com/r/comfyui/comments/1rk5feh/is_there_any_better_way_to_find_the_best_sampler/"
      },
      {
        "title": "What's the best sampler for me?",
        "subreddit": "makinghiphop",
        "upvotes": 7,
        "commentCount": 37,
        "url": "https://www.reddit.com/r/makinghiphop/comments/1n5k6h0/whats_the_best_sampler_for_me/"
      }
    ]
  }
}
```

</details>

<details>
<summary>View example interface</summary>
<p align="center">
  <img
    src="./.github/images/reddit-intelligence-report.png"
    alt="Reddit intelligence report screenshot"
    width="700"
  />
</p>
</details>

## Prerequisites

- [Bun](https://bun.sh) version 1.2.5 or newer
- [Docker](https://docker.com) for running local MongoDB and Redis instances
- A Decodo Web Scraping API token – create an account at [dashboard.decodo.com](https://dashboard.decodo.com/register?page=scrapers/pricing)
- At least one supported LLM provider API key:
  - Anthropic
  - OpenAI
  - Google Gemini

> If you've just installed Bun, open a new terminal window or reload your shell configuration before running `bun install`.
>
> Example:
> - zsh: `source ~/.zshrc`
> - bash: `source ~/.bashrc`


## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Decodo/reddit-scraper
cd reddit-scraper
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Add your:
- Decodo API token
- LLM provider selection
- Anthropic, OpenAI, or Gemini API key

### 4. Start local databases

```bash
bun db:up
```

This starts MongoDB and Redis through Docker Compose.

### 5. Start the Reddit Scraper

```bash
bun dev
```

Frontend:

```text
http://localhost:5274
```

Backend API:

```text
http://localhost:5002
```

## Configuration

After creating your `.env` file during installation, add your API credentials and provider settings:

```env
# Decodo Scraping API
DECODO_BASIC_AUTH_TOKEN=your_decodo_token

# LLM provider (claude | openai | gemini)
LLM_PROVIDER=claude
LLM_MODEL=

# LLM API keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

### Environment variables

| Variable | Description |
| --- | --- |
| `DECODO_BASIC_AUTH_TOKEN` | Decodo Scraping API authentication token |
| `LLM_PROVIDER` | LLM provider to use (`claude`, `openai`, or `gemini`) |
| `LLM_MODEL` | Optional custom model override |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GEMINI_API_KEY` | Google Gemini API key |

## Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start frontend and backend development servers |
| `bun build` | Build all application packages |
| `bun lint` | Run linting across all packages |
| `bun db:up` | Start MongoDB and Redis via Docker Compose |
| `bun db:down` | Stop local database containers |

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TanStack Router, TanStack Query, Tailwind CSS v4, Radix UI |
| Backend | NestJS 11, MongoDB, Mongoose |
| Scraping | Decodo Web Scraping API |
| LLMs | Anthropic Claude, OpenAI GPT, Google Gemini |

## Project structure

```text
apps/
  frontend/
    src/
      features/
        tracker/      # Prompt flow, report generation, API hooks
        queries/      # Query history features
        settings/     # Runtime settings and API key management

      routes/
        _layout/
          tracker.tsx
          history.tsx
          history.$id.tsx
          settings.tsx

  backend/
    src/
      features/
        tracker/      # Scraping and report generation endpoints
        decodo/       # Decodo Scraping API integration
        llm/          # Claude, OpenAI, and Gemini abstraction layer
        queries/      # Query history persistence
        settings/     # Runtime provider and API configuration

  shared/
    # Shared TypeScript types

docs/
```

## Documentation

For additional information about scraping targets, parameters, and API behavior, see the [Decodo Web Scraping API documentation](https://help.decodo.com/docs/web-scraping-api-introduction).

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/tracker/plan` | Generate a scraping plan from a user prompt |
| POST | `/tracker/analyze` | Scrape Reddit and generate an AI report |
| GET | `/queries` | List saved query history |
| GET | `/queries/:id` | Retrieve a full query result |
| DELETE | `/queries/:id` | Delete a saved query |
| GET | `/settings` | Retrieve current provider and API key status |
| PATCH | `/settings` | Update API keys or LLM provider |

## Scraping strategy

Each analysis combines three Decodo scraping targets to collect Reddit data at different levels:

| Step | Target | Purpose |
| --- | --- | --- |
| 1 | `universal` | Search Reddit globally across multiple subreddits |
| 2 | `reddit_subreddit` | Collect trending and relevant subreddit posts |
| 3 | `reddit_post` | Extract full comment threads for deeper analysis |

The LLM generates relevant subreddits and search queries based on the user's prompt. Up to 30 posts are collected, deduplicated, and ranked by engagement before the top results are scraped with full comment threads for AI-powered analysis and summarization.

## Related repositories

- [Decodo SDK for TypeScript](https://github.com/Decodo/sdk-ts)
- [Decodo MCP Server](https://github.com/Decodo/mcp-server)
- More related repositories coming soon

## Contributing

Contributions, ideas, and improvements are welcome.

To contribute:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

For major changes, please open an issue first to discuss the proposed update.

## License

MIT — see [LICENSE](LICENSE)
