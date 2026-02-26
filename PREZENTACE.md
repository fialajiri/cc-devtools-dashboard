# Claude Code – Tipy pro prezentaci

---

### 1. Sessions a příkaz `/clear`
Každý rozhovor s Claude Code probíhá v rámci session, která drží kontext celé konverzace. Pokud chceš začít čistě — například při přechodu na nový úkol — použij příkaz `/clear`. Tím se session resetuje a Claude nezatěžuješ předchozím kontextem.

Důležité: čím více se kontext zaplní, tím horší odpovědi Claude dává. Už při zaplnění přes 60 % kontextového okna se kvalita výrazně zhoršuje. Osvědčený postup je nechat Claudea na konci dlouhé session vytvořit soubor `summary.md` — shrnutí co bylo uděláno, jaká rozhodnutí byla přijata a co zbývá. Pak `/clear`, nová session a `summary.md` jako vstup. Claude tak začne čistě, ale bez ztráty důležitého kontextu.

---

### 2. Prozkoumání codebase
Claude Code umí číst a pochopit celý projekt, nejen jednotlivé soubory. Než začneš s implementací, můžeš se ho zeptat na architekturu, závislosti nebo jak spolu jednotlivé části kódu souvisí. Je to rychlý způsob jak se zorientovat v cizím projektu.

---

### 3. Spouštění kódu v sandboxu pomocí Dockeru
Pokud nechceš, aby Claude Code spouštěl příkazy přímo na tvém systému, můžeš celý projekt zabalit do Docker kontejneru. Claude pak pracuje izolovaně a nemá přístup k tvému lokálnímu prostředí.

---

### 4. Vestavěný sandbox – příkaz `/sandbox`
Claude Code má vlastní integrovaný sandbox. Příkazem `/sandbox` spustíš izolované prostředí přímo v Claude Code, bez nutnosti nastavovat Docker ručně. Vhodné pro rychlé experimenty.

---

### 5. Časté commity
Při práci s Claude Code je dobré commitovat po každém malém kroku. Pokud Claude něco pokazí nebo se vydá špatným směrem, máš čistý bod ke kterému se vrátíš. Malé commity = menší riziko.

---

### 6. Soubor `CLAUDE.md` a podsložky
`CLAUDE.md` je hlavní instrukční soubor, který Claude Code načte při každé nové session. Důležité: `CLAUDE.md` lze přidat i do podsložek projektu. Claude ho pak načte a použije pouze tehdy, když pracuje uvnitř dané složky — hodí se například pro specifické instrukce pro `frontend/` nebo `api/`.

---

### 7. Plan Mode – proč by měl být výchozí
Před tím, než Claude začne psát kód, mu nech nejdřív vytvořit plán. V plan mode Claude popíše co udělá, jaké soubory vytvoří nebo změní — ale nic nespustí. Ty plán zkontroluješ, případně upravíš, a teprve pak dáš souhlas. Zabrání to situacím, kdy Claude jde špatným směrem a ty zjistíš až po deseti změnách souborů.

---

### 8. MCP servery – zejména Context7
MCP (Model Context Protocol) servery rozšiřují schopnosti Claude Code o externí nástroje a zdroje dat. Context7 je MCP server který poskytuje Claude aktuální dokumentaci knihoven a frameworků přímo do kontextu. Claude tak nepracuje jen ze svých trénovacích dat, ale má přístup k aktuální dokumentaci — velmi užitečné u rychle se vyvíjejících technologií.

---

### 9. Ne na všechno potřebuješ AI
Claude Code je mocný nástroj, ale není nutné ho používat na věci, které dobře znáš. Instalaci závislostí, nastavení nástrojů nebo příkazy které znáš zpaměti — udělej sám. AI nejvíc pomáhá tam kde šetří čas na věcech, které by trvaly dlouho nebo které dobře neznáš.

---

### 10. Příkaz `/init`
Na začátku nového projektu spusť `/init`. Claude Code projde celý codebase, přečte `SPEC.md` a na základě toho automaticky vytvoří `CLAUDE.md` soubor s popisem projektu, architekturou a instrukcemi. Dobrý výchozí bod který pak můžeš dále upravovat.

---

### 11. `CLAUDE.md` se načítá při každé session
`CLAUDE.md` není jen dokumentace — je to kontext který Claude Code automaticky načte při každém spuštění nové session. Čím přesnější a aktuálnější `CLAUDE.md` máš, tím méně musíš Claude vysvětlovat znovu a znovu.