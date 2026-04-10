<script lang="ts">
  import { Badge, Card, Input } from "@schale-ledger/ui";

  export let data: unknown;

  const pageData = data as {
    model: null | {
      query: { q: string; school: string; role: string; position: string; page: number };
      filters: { school: string; role: string; position: string };
      pagination: { page: number; pageCount: number; total: number; previousPage: number | null; nextPage: number | null };
      students: Array<{
        studentId: string;
        name: string;
        school: string;
        role: string;
        position: string;
        progress: null | { level: number; rarity: number; uniqueWeaponRank: number };
      }>;
    };
  };
</script>

{#if pageData.model}
  <section class="flex flex-col gap-6">
    <div class="space-y-2">
      <Badge>Students</Badge>
      <h2 class="text-3xl font-semibold tracking-tight">Student explorer</h2>
      <p class="text-sm text-[var(--color-muted-foreground)]">Search roster entries and inspect current progress snapshots.</p>
    </div>

    <Card title="Search" description="Filter the roster by keyword and role metadata.">
      <form class="grid gap-3 md:grid-cols-4" method="GET">
        <Input name="q" value={pageData.model.query.q} placeholder="Search by name" />
        <Input name="school" value={pageData.model.query.school} placeholder="School" />
        <Input name="role" value={pageData.model.query.role} placeholder="Role" />
        <Input name="position" value={pageData.model.query.position} placeholder="Position" />
      </form>
    </Card>

    <Card title="Roster" description={`${pageData.model.pagination.total} matching students`}>
      <div class="space-y-3">
        {#if pageData.model.students.length === 0}
          <p class="text-sm text-[var(--color-muted-foreground)]">No students match the current filters.</p>
        {:else}
          {#each pageData.model.students as student}
            <a class="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 transition hover:border-[var(--color-accent)]" href={`/students/${student.studentId}`}>
              <div>
                <p class="font-medium">{student.name}</p>
                <p class="text-sm text-[var(--color-muted-foreground)]">{student.school} · {student.role} · {student.position}</p>
              </div>
              <div class="text-right text-sm text-[var(--color-muted-foreground)]">
                {#if student.progress}
                  <p>Lv {student.progress.level}</p>
                  <p>★ {student.progress.rarity}</p>
                {:else}
                  <p>No progress</p>
                {/if}
              </div>
            </a>
          {/each}
        {/if}
      </div>

      <div class="mt-4 flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
        <span>Page {pageData.model.pagination.page} / {pageData.model.pagination.pageCount}</span>
        <div class="flex items-center gap-2">
          {#if pageData.model.pagination.previousPage}
            <a class="rounded-lg border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-muted)]" href={`?q=${encodeURIComponent(pageData.model.query.q)}&school=${encodeURIComponent(pageData.model.query.school)}&role=${encodeURIComponent(pageData.model.query.role)}&position=${encodeURIComponent(pageData.model.query.position)}&page=${pageData.model.pagination.previousPage}`}>Previous</a>
          {/if}

          {#if pageData.model.pagination.nextPage}
            <a class="rounded-lg border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-muted)]" href={`?q=${encodeURIComponent(pageData.model.query.q)}&school=${encodeURIComponent(pageData.model.query.school)}&role=${encodeURIComponent(pageData.model.query.role)}&position=${encodeURIComponent(pageData.model.query.position)}&page=${pageData.model.pagination.nextPage}`}>Next</a>
          {/if}
        </div>
      </div>
    </Card>
  </section>
{/if}
