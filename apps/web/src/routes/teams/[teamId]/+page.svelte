<script lang="ts">
  import { Badge, Card, Input } from "@schale-ledger/ui";

  export let data: unknown;

  const pageData = data as {
    team: null | {
      teamId: string;
      name: string;
      mode: string;
      memo: string;
      slots: string[];
      roster: Array<{ studentId: string; name: string; school: string; role: string; position: string }>;
    };
  };
</script>

{#if pageData.team}
  <section class="flex flex-col gap-6">
    <div class="space-y-2">
      <Badge>Team detail</Badge>
      <h2 class="text-3xl font-semibold tracking-tight">{pageData.team.name}</h2>
      <p class="text-sm text-[var(--color-muted-foreground)]">Set team mode, memo, and ordered member slots.</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card title="Team editor" description="Save up to six ordered members.">
        <form class="grid gap-4 md:grid-cols-2" method="POST">
          <label class="space-y-2 text-sm md:col-span-2">
            <span>Name</span>
            <Input name="name" value={pageData.team.name} />
          </label>

          <label class="space-y-2 text-sm">
            <span>Mode</span>
            <select class="h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 text-sm" name="mode">
              <option value="raid" selected={pageData.team.mode === "raid"}>raid</option>
              <option value="jfd" selected={pageData.team.mode === "jfd"}>jfd</option>
            </select>
          </label>

          <label class="space-y-2 text-sm">
            <span>Memo</span>
            <Input name="memo" value={pageData.team.memo} />
          </label>

          {#each pageData.team.slots as slot, index}
            <label class="space-y-2 text-sm">
              <span>Slot {index + 1}</span>
              <Input name={`slot${index}`} value={slot} placeholder="student id" />
            </label>
          {/each}

          <div class="md:col-span-2">
            <button class="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-foreground)]" type="submit">Save team</button>
          </div>
        </form>
      </Card>

      <Card title="Roster reference" description="Available students for quick copy/paste.">
        <div class="space-y-3 text-sm">
          {#each pageData.team.roster as student}
            <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3">
              <p class="font-medium">{student.name}</p>
              <p class="text-[var(--color-muted-foreground)]">{student.studentId} · {student.role} · {student.position}</p>
            </div>
          {/each}
        </div>
      </Card>
    </div>
  </section>
{/if}
