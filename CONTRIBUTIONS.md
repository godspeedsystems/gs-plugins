# Contribute to Godspeed

We offer a generous free tier with the hope that you'll find value in using Godspeed and, in return, contribute to enhancing the product for the entire community. There are numerous ways in which you can make valuable contributions!

[![Latest release](https://badgen.net/static/release/v1.0.32/blue?icon=awesome)](https://github.com/hasura/graphql-engine/releases/latest)
<a href="https://www.godspeed.systems/"><img src="https://static.wixstatic.com/media/f90422_f39401b0fbe14da482ef9c5389665b41~mv2.png/v1/crop/x_0,y_531,w_1080,h_220/fill/w_295,h_60,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Logo%20(8).png" alt="godspeed logo" align="right" width="200" ></a>
[![Docs](https://badgen.net/static/docs/v1/green)](https://docs.godspeed.systems/docs/preface)


## Follow, Star & Subscribe

<div>
    <a style="margin:10px;" href="https://www.linkedin.com/company/godspeed-systems/"><img src="https://badgen.net/static/follow/linkedin/blue"></a>    
    <a style="margin:10px;" href="https://github.com/godspeedsystems/gs-node-service"><img src="https://badgen.net/static/follow/github/Priority-green"></a>
    <a style="margin:10px;" href="https://www.youtube.com/@godspeed.systems/videos"><img src="https://badgen.net/static/follow/youtube/red"></a>
</div>

## Recommend Us!

One of the most effective ways to show your support for Godspeed is by suggesting us to your friends and colleagues.


## Ask & Answer Questions

If you have a question about Godspeed or need assistance with problem-solving, please feel free to ask in our Discord channels. It's highly likely that someone else may have a similar question, and by assisting you, we can also support others who might come across the same inquiries and difficulties. Alternatively, you can also pay it forward by helping to answer questions from fellow users.

<a href="https://discord.gg/ZGxjWAHA"><img src="https://img.shields.io/badge/chat-discord-purple.svg?logo=discord&style=flat"></a>



# Contributing to Cal.com

Contributions are what makes the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- Before jumping into a PR be sure to search [existing PRs](https://github.com/calcom/cal.com/pulls) or [issues](https://github.com/calcom/cal.com/issues) for an open or closed item that relates to your submission.

## Priorities

<table>
  <tr>
    <td>
      Type of Issue
    </td>
    <td>
      Priority
    </td>
  </tr>
  <tr>
    <td>
      Minor improvements, non-core feature requests
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:%22Low+priority%22">
        <img src="https://img.shields.io/badge/-Low%20Priority-green">
      </a>
    </td>
  </tr>
   <tr>
    <td>
      Confusing UX (... but working)
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:%22Medium+priority%22">
        <img src="https://img.shields.io/badge/-Medium%20Priority-yellow">
      </a>
    </td>
  </tr>
  <tr>
    <td>
      Core Features (Booking page, availability, timezone calculation)
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:%22High+priority%22">
        <img src="https://img.shields.io/badge/-High%20Priority-orange">
      </a>
    </td>
  </tr>
  <tr>
    <td>
      Core Bugs (Login, Booking page, Emails are not working)
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:Urgent">
        <img src="https://img.shields.io/badge/-Urgent-red">
      </a>
    </td>
  </tr>
</table>

## Developing

The development branch is `main`. This is the branch that all pull
requests should be made against. The changes on the `main`
branch are tagged into a release monthly.

To develop locally:

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account and then
   [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
2. Create a new branch:

   ```sh
   git checkout -b MY_BRANCH_NAME
   ```

3. Install yarn:

   ```sh
   npm install -g yarn
   ```

4. Install the dependencies with:

   ```sh
   yarn
   ```

5. Set up your `.env` file:

   - Duplicate `.env.example` to `.env`.
   - Use `openssl rand -base64 32` to generate a key and add it under `NEXTAUTH_SECRET` in the `.env` file.
   - Use `openssl rand -base64 24` to generate a key and add it under `CALENDSO_ENCRYPTION_KEY` in the `.env` file.

6. Start developing and watch for code changes:

   ```sh
   yarn dev
   ```

## Building

You can build the project with:

```bash
yarn build
```

Please be sure that you can make a full production build before pushing code.

## Testing

More info on how to add new tests coming soon.

### Running tests

This will run and test all flows in multiple Chromium windows to verify that no critical flow breaks:

```sh
yarn test-e2e
```

## Linting

To check the formatting of your code:

```sh
yarn lint
```

If you get errors, be sure to fix them before committing.

## Making a Pull Request

- Be sure to [check the "Allow edits from maintainers" option](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork) while creating your PR.
- If your PR refers to or fixes an issue, be sure to add `refs #XXX` or `fixes #XXX` to the PR description. Replacing `XXX` with the respective issue number. See more about [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue).
- Be sure to fill the PR Template accordingly.