<div align="center">
  <a href="https://www.godspeed.systems">
    <img
      src="https://static.wixstatic.com/media/f90422_f39401b0fbe14da482ef9c5389665b41~mv2.png/v1/crop/x_0,y_531,w_1080,h_220/fill/w_295,h_60,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Logo%20(8).png"
      alt="Godspeed"
      height="64"
    />
  </a>
  <h3>
    <b>
      Godspeed
    </b>
  </h3>
  <b>
    Open Source Plugins Development Ecosystem
  </b>
  <p>

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CONTRIBUTIONS.md)   [![Open Bounties](https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Fgodspeedsystems%2Fbounties%3Fstatus%3Dopen)](https://console.algora.io/org/godspeedsystems/bounties?status=open)  [![Discord](https://img.shields.io/badge/chat-discord-brightgreen.svg?logo=discord&style=flat)](https://discord.gg/ZGxjWAHA)
  </p>



  <br />

</div>

# Godspeed Plug-in generator 
#### Godspeed Plug-in generator creates template of plugin based on your selected choices.




A brief description of how use `generator-godspeed-plugin`.

### Steps to create new plug-in with Godspeed Plug-in generator:
Certainly, here are the provided steps rephrased:

 Begin by installing the `generator-godspeed-plugin` globally using the following commands:

   ```bash
   npm install -g generator-godspeed-plugin
   npm install -g yo
   ```

 To initiate the creation of your plugin, execute the following command in your terminal:

   ```bash
   yo godspeed-plugin
   ```

 After running the above command, you'll be prompted to enter your desired plugin name. Proceed by typing it in:

   ```bash
   ? Enter your plugin name: (your-plugin-name)
   ```

 Select the type of plugin that aligns with your project's requirements. You can choose from the following options:

   ```bash
   ? Select the type of plugin: (Use arrow keys)
   ❯ DataSource 
     EventSource 
     DataSource-As-EventSource 
   ```

based on your inputs it creates a plugin folder `${your-plugin-name}-as-{type of plugin}`.