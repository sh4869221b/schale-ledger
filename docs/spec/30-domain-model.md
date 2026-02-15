# 30 Domain Model

## Entity
- User
  - `userId`
- Student (master)
  - `studentId`, `name`, `school`, `role`, `position`, `attackType`, `defenseType`, `rarityBase`, `isLimited`
- UserStudentProgress
  - PK概念: `(userId, studentId)`
  - `level`, `rarity`, `bondLevel`, `exSkillLevel`, `normalSkillLevel`, `passiveSkillLevel`, `subSkillLevel`, `equipment1Tier`, `equipment2Tier`, `equipment3Tier`, `uniqueWeaponRank`, `uniqueWeaponLevel`, `shardsOwned`, `shardsUsed`, `favoriteGifts`, `memo`
- Team
  - `teamId`, `userId`, `name`, `mode`, `memo`, `createdAt`, `updatedAt`
- TeamMember
  - PK概念: `(teamId, positionIndex)`
  - `studentId`, `positionIndex`, `isSupport`

## Invariant
- `userId` 越境は禁止
- Progress は `(userId, studentId)` 一意
- TeamMember は `(teamId, positionIndex)` 一意
- `positionIndex` は `0..N-1`
- MVP mode と slot
  - `raid`: `N=6`
  - `jfd`: `N=6`
- TeamMember は Student を参照する
