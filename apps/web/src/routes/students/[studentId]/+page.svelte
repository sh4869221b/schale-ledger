<script lang="ts">
  import { Badge, Card } from "@schale-ledger/ui";

  export let data: unknown;

  const pageData = data as {
    student: null | {
      studentId: string;
      name: string;
      school: string;
      role: string;
      position: string;
      attackType: string;
      defenseType: string;
      rarityBase: number;
      isLimited: boolean;
      progress: null | {
        level: number;
        rarity: number;
        bondLevel: number;
        exSkillLevel: number;
        normalSkillLevel: number;
        passiveSkillLevel: number;
        subSkillLevel: number;
        equipment1Tier: number;
        equipment2Tier: number;
        equipment3Tier: number;
        uniqueWeaponRank: number;
        uniqueWeaponLevel: number;
        shardsOwned: number;
        shardsUsed: number;
        favoriteGifts: number;
        memo: string;
      };
    };
  };
</script>

{#if pageData.student}
  <section class="flex flex-col gap-6">
    <div class="space-y-2">
      <Badge>Student detail</Badge>
      <h2 class="text-3xl font-semibold tracking-tight">{pageData.student.name}</h2>
      <p class="text-sm text-[var(--color-muted-foreground)]">{pageData.student.school} · {pageData.student.role} · {pageData.student.position}</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card title="Profile" description="Master data snapshot for this student.">
        <dl class="grid gap-3 text-sm md:grid-cols-2">
          <div><dt class="text-[var(--color-muted-foreground)]">Attack</dt><dd>{pageData.student.attackType}</dd></div>
          <div><dt class="text-[var(--color-muted-foreground)]">Defense</dt><dd>{pageData.student.defenseType}</dd></div>
          <div><dt class="text-[var(--color-muted-foreground)]">Base rarity</dt><dd>{pageData.student.rarityBase}</dd></div>
          <div><dt class="text-[var(--color-muted-foreground)]">Limited</dt><dd>{pageData.student.isLimited ? "Yes" : "No"}</dd></div>
        </dl>
      </Card>

      <Card title="Progress snapshot" description="Current saved values for this operator.">
        {#if pageData.student.progress}
          <dl class="grid gap-3 text-sm md:grid-cols-2">
            <div><dt class="text-[var(--color-muted-foreground)]">Level</dt><dd>{pageData.student.progress.level}</dd></div>
            <div><dt class="text-[var(--color-muted-foreground)]">Rarity</dt><dd>{pageData.student.progress.rarity}</dd></div>
            <div><dt class="text-[var(--color-muted-foreground)]">Bond</dt><dd>{pageData.student.progress.bondLevel}</dd></div>
            <div><dt class="text-[var(--color-muted-foreground)]">UE rank</dt><dd>{pageData.student.progress.uniqueWeaponRank}</dd></div>
          </dl>
        {:else}
          <p class="text-sm text-[var(--color-muted-foreground)]">No progress saved yet.</p>
        {/if}
      </Card>
    </div>
  </section>
{/if}
