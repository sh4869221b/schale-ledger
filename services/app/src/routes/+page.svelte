<svelte:head>
  <title>シャーレ育成手帳</title>
</svelte:head>

<main>
  <h1>シャーレ育成手帳</h1>
  <p class="lead">生徒育成データと編成データを管理します。</p>

  <section>
    <h2>生徒一覧</h2>
    <div class="row">
      <input bind:value={studentQuery} placeholder="生徒名で検索" />
      <button on:click={loadStudents}>検索</button>
    </div>
    <pre>{studentsResult}</pre>
  </section>

  <section>
    <h2>生徒詳細</h2>
    <div class="row">
      <input bind:value={studentId} placeholder="studentId" />
      <button on:click={loadStudentDetail}>詳細取得</button>
    </div>
    <pre>{studentDetailResult}</pre>
  </section>

  <section>
    <h2>生徒進捗更新（Upsert）</h2>
    <p>JSONで patch を入力してください。</p>
    <textarea bind:value={progressPatchJson}></textarea>
    <div class="row">
      <button on:click={upsertProgress}>進捗を保存</button>
    </div>
    <pre>{progressResult}</pre>
  </section>

  <section>
    <h2>編成一覧</h2>
    <div class="row">
      <select bind:value={teamMode}>
        <option value="">全モード</option>
        <option value="raid">raid</option>
        <option value="jfd">jfd</option>
      </select>
      <button on:click={loadTeams}>一覧取得</button>
    </div>
    <pre>{teamsResult}</pre>
  </section>

  <section>
    <h2>編成詳細</h2>
    <div class="row">
      <input bind:value={teamId} placeholder="teamId" />
      <button on:click={loadTeam}>詳細取得</button>
    </div>
    <pre>{teamDetailResult}</pre>
  </section>

  <section>
    <h2>編成メンバー置換（Replace）</h2>
    <p>JSONで `members` 配列を入力してください。</p>
    <textarea bind:value={teamMembersJson}></textarea>
    <div class="row">
      <button on:click={replaceTeamMembers}>メンバー置換</button>
    </div>
    <pre>{teamReplaceResult}</pre>
  </section>
</main>

<script lang="ts">
  let studentQuery = "";
  let studentId = "S0001";
  let teamId = "";
  let teamMode = "";

  let studentsResult = "-";
  let studentDetailResult = "-";
  let progressResult = "-";
  let teamsResult = "-";
  let teamDetailResult = "-";
  let teamReplaceResult = "-";

  let progressPatchJson = JSON.stringify(
    {
      level: 50,
      rarity: 5,
      exSkillLevel: 5,
      normalSkillLevel: 5,
      passiveSkillLevel: 5,
      subSkillLevel: 5,
      equipment1Tier: 5,
      equipment2Tier: 5,
      equipment3Tier: 5,
      uniqueWeaponRank: 2,
      uniqueWeaponLevel: 30,
      shardsOwned: 150,
      shardsUsed: 80,
      favoriteGifts: 2,
      memo: "UI更新テスト"
    },
    null,
    2
  );

  let teamMembersJson = JSON.stringify(
    {
      members: [
        { studentId: "S0001", positionIndex: 0, isSupport: false },
        { studentId: "S0002", positionIndex: 1, isSupport: false },
        { studentId: "S0003", positionIndex: 2, isSupport: true }
      ]
    },
    null,
    2
  );

  async function fetchText(path: string, init?: RequestInit): Promise<string> {
    const res = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {})
      }
    });

    const text = await res.text();
    return `${res.status} ${res.statusText}\n${text}`;
  }

  async function loadStudents() {
    const query = studentQuery ? `?q=${encodeURIComponent(studentQuery)}` : "";
    studentsResult = await fetchText(`/api/students${query}`);
  }

  async function loadStudentDetail() {
    studentDetailResult = await fetchText(`/api/students/${encodeURIComponent(studentId)}`);
  }

  async function upsertProgress() {
    let payload: unknown;
    try {
      payload = JSON.parse(progressPatchJson);
    } catch (error) {
      progressResult = `JSON parse error: ${String(error)}`;
      return;
    }

    progressResult = await fetchText(`/api/students/${encodeURIComponent(studentId)}/progress`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }

  async function loadTeams() {
    const query = teamMode ? `?mode=${encodeURIComponent(teamMode)}` : "";
    teamsResult = await fetchText(`/api/teams${query}`);
  }

  async function loadTeam() {
    teamDetailResult = await fetchText(`/api/teams/${encodeURIComponent(teamId)}`);
  }

  async function replaceTeamMembers() {
    let payload: unknown;
    try {
      payload = JSON.parse(teamMembersJson);
    } catch (error) {
      teamReplaceResult = `JSON parse error: ${String(error)}`;
      return;
    }

    teamReplaceResult = await fetchText(`/api/teams/${encodeURIComponent(teamId)}/members`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }
</script>

<style>
  :global(body) {
    margin: 0;
    font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;
    color: #182230;
    background: radial-gradient(circle at top left, #fdf2f8, #eff6ff 45%, #ecfeff);
  }

  main {
    max-width: 920px;
    margin: 0 auto;
    padding: 28px 20px 40px;
  }

  h1 {
    margin-bottom: 6px;
    font-size: 2rem;
  }

  .lead {
    margin-top: 0;
    color: #334155;
  }

  section {
    margin-top: 18px;
    padding: 16px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  }

  h2 {
    margin-top: 0;
    font-size: 1.2rem;
  }

  .row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  input,
  select,
  textarea,
  button {
    font: inherit;
  }

  input,
  select {
    min-width: 220px;
    padding: 8px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
  }

  textarea {
    width: 100%;
    min-height: 160px;
    padding: 8px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
  }

  button {
    border: none;
    border-radius: 8px;
    background: #0369a1;
    color: #fff;
    padding: 8px 12px;
    cursor: pointer;
  }

  pre {
    margin: 0;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    border-radius: 8px;
    background: #0f172a;
    color: #dbeafe;
    padding: 10px;
  }

  @media (max-width: 640px) {
    main {
      padding: 18px 12px 28px;
    }

    section {
      padding: 12px;
    }

    input,
    select {
      width: 100%;
      min-width: 0;
    }
  }
</style>
