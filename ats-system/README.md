<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Velocity ATS - Recruitment Management System

Velocity ATS is a high-performance recruitment platform designed for efficient candidate management, hiring drives, and automated communication.

## 📧 Email Branding & Templates (LOCKED)

The system uses a standardized, locked email design for all professional communications.

- **Branding Color:** `#2b7dfb` (Velocity Blue)
- **Logo:** `Logo.png` (Height: 65px, Vertical Padding: 15px)
- **Subject Format:** `"{Subject} | {{candidate_name}}"`
- **Key Notice:** All interview emails include a 15-minute early arrival instruction.
- **Management:** To update or sync templates with the database, run:
  ```bash
  $ npx ts-node update_all_email_templates.ts
  ```

## 🌍 Timezone Standards

- **System Standard:** `Asia/Kolkata` (IST)
- All interview slots, candidate notifications, and system logs are synchronized to IST to ensure consistency across different recruiter locations.

## 🛠️ Project Setup

```bash
# install dependencies
$ npm install

# generate prisma client
$ npx prisma generate

# start backend (Port 4000)
$ npm run start:dev

# start frontend (Port 3000)
$ cd ats-frontend && npm run dev
```

## 📋 Architectural Mandates

- **Candidate Merging:** Automatic field population for existing candidates; never overwrites established data.
- **Evaluation Logic:** Mandatory primary and sub-reasons for all candidate reviews.
- **Permissions:** Granular JSON-based permission system per module.

## 📂 Key Files

- `GEMINI.md`: Core system instructions and locked mandates.
- `prisma/schema.prisma`: Database architecture.
- `src/slots/slots.service.ts`: Core logic for hiring drives and slot booking.

## License

Internal Property of Velocity Software Solutions Pvt. Ltd.

