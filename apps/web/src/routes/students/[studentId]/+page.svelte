<script lang="ts">
  import { Badge, Card, Input } from "@schale-ledger/ui";

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
    formState: {
      success: boolean;
      errors: Record<string, string[]> | null;
      values: Record<string, unknown> | null;
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

    <Card title="Edit progress" description="Update saved progression values for this operator.">
      {#if pageData.formState.success}
        <p class="mb-4 text-sm text-[var(--color-accent)]">Progress saved.</p>
      {/if}

      <form class="grid gap-4 md:grid-cols-2" method="POST" action={`/students/${pageData.student.studentId}/progress`}>
        <label class="space-y-2 text-sm">
          <span>Level</span>
          <Input name="level" value={String(pageData.formState.values?.level ?? pageData.student.progress?.level ?? 1)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Rarity</span>
          <Input name="rarity" value={String(pageData.formState.values?.rarity ?? pageData.student.progress?.rarity ?? 1)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Bond</span>
          <Input name="bondLevel" value={String(pageData.formState.values?.bondLevel ?? pageData.student.progress?.bondLevel ?? 1)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>UE rank</span>
          <Input name="uniqueWeaponRank" value={String(pageData.formState.values?.uniqueWeaponRank ?? pageData.student.progress?.uniqueWeaponRank ?? 0)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>EX skill</span>
          <Input name="exSkillLevel" value={String(pageData.formState.values?.exSkillLevel ?? pageData.student.progress?.exSkillLevel ?? 1)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Normal skill</span>
          <Input name="normalSkillLevel" value={String(pageData.formState.values?.normalSkillLevel ?? pageData.student.progress?.normalSkillLevel ?? 1)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Passive skill</span>
          <Input name="passiveSkillLevel" value={String(pageData.formState.values?.passiveSkillLevel ?? pageData.student.progress?.passiveSkillLevel ?? 1)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Sub skill</span>
          <Input name="subSkillLevel" value={String(pageData.formState.values?.subSkillLevel ?? pageData.student.progress?.subSkillLevel ?? 1)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Equipment 1</span>
          <Input name="equipment1Tier" value={String(pageData.formState.values?.equipment1Tier ?? pageData.student.progress?.equipment1Tier ?? 0)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Equipment 2</span>
          <Input name="equipment2Tier" value={String(pageData.formState.values?.equipment2Tier ?? pageData.student.progress?.equipment2Tier ?? 0)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Equipment 3</span>
          <Input name="equipment3Tier" value={String(pageData.formState.values?.equipment3Tier ?? pageData.student.progress?.equipment3Tier ?? 0)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>UE level</span>
          <Input name="uniqueWeaponLevel" value={String(pageData.formState.values?.uniqueWeaponLevel ?? pageData.student.progress?.uniqueWeaponLevel ?? 0)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Shards owned</span>
          <Input name="shardsOwned" value={String(pageData.formState.values?.shardsOwned ?? pageData.student.progress?.shardsOwned ?? 0)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Shards used</span>
          <Input name="shardsUsed" value={String(pageData.formState.values?.shardsUsed ?? pageData.student.progress?.shardsUsed ?? 0)} />
        </label>
        <label class="space-y-2 text-sm">
          <span>Favorite gifts</span>
          <Input name="favoriteGifts" value={String(pageData.formState.values?.favoriteGifts ?? pageData.student.progress?.favoriteGifts ?? 0)} />
        </label>
        <label class="space-y-2 text-sm md:col-span-2">
          <span>Memo</span>
          <Input name="memo" value={String(pageData.formState.values?.memo ?? pageData.student.progress?.memo ?? "")} />
        </label>

        {#if pageData.formState.errors}
          <div class="md:col-span-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {#each Object.entries(pageData.formState.errors) as [field, messages]}
              <p>{field}: {messages?.join(", ")}</p>
            {/each}
          </div>
        {/if}

        <div class="md:col-span-2">
          <button class="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-foreground)]" type="submit">Save progress</button>
        </div>
      </form>
    </Card>
  </section>
{/if}
