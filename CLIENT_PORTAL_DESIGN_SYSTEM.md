# Client Portal — Design System (Acme Servers Reference)

Este documento define a **linguagem visual** da Área do Cliente, calibrada para replicar com alta fidelidade o dashboard de monitorização **Acme Servers**: modo claro, superfícies suaves, hierarquia nítida, estados semânticos (verde / âmbar / vermelho / azul info) e layout **Sidebar + Conteúdo + Painel contextual à direita**.

> **Fonte de verdade visual:** captura de referência (painel “Acme Servers”: navegação agrupada, top bar com pesquisa e filtros, cartão “Needs Attention”, três cartões de métricas com área-chart, lista de servidores por ambiente, painel “Server Details” + “Recent Activity”).  
> Os valores hex abaixo alinham com a análise da interface e com a escala **Tailwind CSS** (gray / emerald / amber / red / blue / orange) para implementação consistente.

---

## 1. Visual Theme & Atmosphere

- **Tema:** claro, “soft enterprise”, sem ruído visual; fundo global ligeiramente acinzentado (não branco puro na viewport) para destacar cartões brancos.
- **Sensação:** premium operacional — muito espaço em branco, grelha rígida, tipografia sans geométrica, ícones de traço fino (estilo Lucide / Heroicons).
- **Profundidade:** elevação quase sempre **sombra difusa baixa** + **borda 1px** cinza muito clara, em vez de sombras pesadas.
- **Contraste:** texto principal alto contraste (`gray-900`); metadados e labels em `gray-500` / `gray-400`; nunca depender só da cor para significado (acessibilidade).

**Características-chave**

| Dimensão | Tratamento |
|----------|------------|
| Fundo de página | `#F9FAFB` (gray-50) |
| Superfície de cartão | `#FFFFFF` com `border` + `shadow-sm` |
| Sidebar / active track | `#F3F4F6` (gray-100) para item ativo em formato pill |
| Status operacional | Verde âmbar / vermelho apenas para semântica (saúde, alerta, crítico) |
| Dados técnicos | Monospace para IP, IDs, percentagens em tabelas densas |

---

## 2. Color Palette (roles + hex)

### Neutros (base UI)

| Token | Hex | Uso |
|-------|-----|-----|
| `portal-bg-page` | `#F9FAFB` | Fundo global da aplicação |
| `portal-bg-subtle` | `#F3F4F6` | Sidebar, hover de linha, trilho do item ativo |
| `portal-surface` | `#FFFFFF` | Cartões, painel direito, linhas de tabela |
| `portal-border` | `#E5E7EB` | Bordas padrão (gray-200) |
| `portal-border-strong` | `#D1D5DB` | Divisores fortes, inputs em repouso |
| `portal-text-primary` | `#111827` | Títulos, nomes de servidor (gray-900) |
| `portal-text-secondary` | `#4B5563` | Corpo secundário (gray-600) |
| `portal-text-muted` | `#6B7280` | Descrições, meta (gray-500) |
| `portal-text-label` | `#9CA3AF` | Labels em maiúsculas, timestamps (gray-400) |

### Semânticos (monitorização)

| Token | Hex | Uso |
|-------|-----|-----|
| `portal-success` | `#10B981` | Healthy, Running, barra baixa (emerald-500) |
| `portal-warning` | `#F59E0B` | Carga média, aviso (amber-500) |
| `portal-danger` | `#EF4444` | Crítico, alerta vermelho (red-500) |
| `portal-info` | `#3B82F6` | Links, ícones info, acentos (blue-500) |
| `portal-accent-orange` | `#F97316` | Tráfego rede / série laranja (orange-500, opcional) |

### Gráficos (séries)

| Série | Cor de linha | Preenchimento (gradiente) |
|-------|----------------|----------------------------|
| CPU | `#10B981` | `from-emerald-500/20 to-transparent` |
| Memory | `#EAB308` ou `#F59E0B` | `from-amber-400/20 to-transparent` |
| Network | `#F97316` | `from-orange-500/20 to-transparent` |

### “Needs Attention”

| Elemento | Tratamento sugerido |
|----------|---------------------|
| Fundo do cartão | `#FEF2F2` (red-50) ou `bg-red-50/80` |
| Borda | `#FECACA` (red-200) ou `border-red-200` |
| Ícone / contador | `#EF4444` (red-500) |
| Texto | Título `gray-900`, corpo `gray-600` |

### Barras de progresso (uso → cor)

| Faixa | Cor de preenchimento |
|-------|------------------------|
| 0–60% aprox. | `#10B981` |
| 60–85% | `#F59E0B` |
| >85% | `#EF4444` |

*(Ajustar thresholds por produto; manter a mesma lógica em toda a app.)*

---

## 3. Typography Scale

**Famílias recomendadas**

- **UI / interface:** `Inter` ou `Geist Sans` (variável), com `system-ui` como fallback.
- **Dados / IP / métricas:** `Geist Mono`, `IBM Plex Mono` ou `ui-monospace`.

**Escala (sugerida, 1rem = 16px)**

| Token | Tamanho | Peso | Line-height | Letter-spacing | Uso |
|-------|---------|------|-------------|----------------|-----|
| `text-display` | 1.5rem (24px) | 600 | 1.25 | -0.02em | Título de página (“Servers”) |
| `text-title` | 1.125rem (18px) | 600 | 1.35 | -0.01em | Secções (“Server Details”) |
| `text-body` | 0.875rem (14px) | 400–500 | 1.5 | 0 | Corpo, células de tabela |
| `text-body-sm` | 0.8125rem (13px) | 400 | 1.45 | 0 | Linhas secundárias |
| `text-caption` | 0.75rem (12px) | 500 | 1.33 | 0.02em | Labels de grupo uppercase (“RESOURCES”) |
| `text-mono` | 0.75rem–0.8125rem | 400 | 1.4 | 0 | IP, percentagens tabulares |

**Regras**

- Títulos de secção: semibold (`600`), cor `gray-900`.
- Subtítulos descritivos (“Manage and monitor…”): `text-gray-500`, `text-sm`.
- Nunca usar mais de **3 níveis** de tamanho no mesmo cartão sem necessidade.

---

## 4. Spacing, Grid & Radius

**Base:** múltiplos de **4px** (Tailwind default); padding interno de cartões **20–24px** (`p-5` / `p-6`).

| Contexto | Valor típico |
|----------|----------------|
| Gutter entre secções principais | `gap-6` (24px) ou `gap-8` (32px) |
| Padding horizontal da área principal | `px-6` / `px-8` em desktop |
| Altura da top bar | 56–64px (`h-14` / `h-16`) |
| Largura sidebar | 240–280px (`w-60` / `w-64`) |
| Largura painel direito | 320–380px |

**Raio de borda**

- Cartões, inputs, dropdowns: **8px** (`rounded-lg`) ou **12px** (`rounded-xl`) — escolher **um** padrão global e manter.
- Pills (filtros, item ativo na sidebar): `rounded-full` ou `rounded-lg` conforme referência.

**Sombras**

- Cartão padrão: `shadow-sm`  
- Botão primário outline: `shadow-sm` leve  
- Evitar sombras grandes exceto modais / overlays  

---

## 5. Border, Sombras & Profundidade

| Nível | CSS (Tailwind) | Uso |
|-------|----------------|-----|
| Flat | `bg-gray-50` | Página |
| Elevado | `bg-white border border-gray-200 shadow-sm` | Cartões |
| Inset listing | `divide-y divide-gray-200` | Listas e tabelas |
| Overlay mobile | `bg-black/40` | Backdrop sidebar |

---

## 6. Estados de interação

| Estado | Tratamento |
|--------|------------|
| Hover linha tabela | `hover:bg-gray-50` |
| Hover botão ghost | `hover:bg-gray-100` |
| Focus visível | `ring-2 ring-blue-500/30 ring-offset-2` (manter contraste WCAG) |
| Active nav | `bg-gray-100 text-gray-900` (pill) |
| Disabled | `opacity-50 pointer-events-none` |

---

## 7. Component Library (especificação)

### 7.1 Sidebar

- Logo + nome da marca no topo (bold).
- Grupos com label **uppercase** `text-[11px] font-medium text-gray-400 tracking-wide` (“RESOURCES”, “MONITORING”).
- Cada item: ícone 20px + label `text-sm font-medium`; ativo = fundo `bg-gray-100` + cantos arredondados.
- Rodapé: avatar quadrado com iniciais, nome, email `text-xs text-gray-500`.

### 7.2 Top bar

- Campo de pesquisa: largura flexível, `h-9`/`h-10`, ícone à esquerda, `border-gray-200`, `rounded-lg`, `bg-white`.
- Três dropdowns estilo pill: mesma altura, `border`, `text-sm`, chevron.
- Botão “+ New Server”: `bg-white border border-gray-900/10` (ou `border-gray-300`), texto `gray-900`, `rounded-lg`, `shadow-sm`, ícone `+`.

### 7.3 “Needs Attention”

- Cartão full-width acima das métricas.
- Cabeçalho: ícone alerta vermelho + título + badge número (`rounded-full bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5`).
- Grelha interna 2×2 ou 4 colunas: mini-cartões com título, subtítulo e valor % em vermelho se crítico.

### 7.4 Cartões de métricas (CPU / Memory / Network)

- Cabeçalho: ícone + título à esquerda; valor atual (percentagem) à direita, `text-lg font-semibold`.
- Área por baixo: gráfico com linha suave + área com gradiente; eixo implícito “Last 24 hours” vs “Current” nos extremos inferiores (`text-xs text-gray-400 flex justify-between`).

### 7.5 Lista de servidores

- Cabeçalho de grupo: “PRODUCTION” + badge count à direita; idem STAGING.
- Linha: ícone tipo + nome (bold) + dot de estado (verde/vermelho) + IP `font-mono` + região + specs.
- Barras CPU/RAM/Disk: track `h-1.5` ou `h-2` `bg-gray-100 rounded-full`; fill com cor por limiar.
- Ações: botão `⋯` à direita.

### 7.6 Painel “Server Details” (direita)

- Header: nome servidor + badge “Running” (dot verde).
- Secção Resources: mesmas métricas com barras mais altas e percentagens explícitas.
- Lista detalhe: `label text-gray-500` / `value text-gray-900`; IP com ícone copiar.
- Recent Activity: timeline vertical, dot + linha `border-l border-gray-200`, texto + tempo relativo `text-xs text-gray-400`.

---

## 8. Snippets Tailwind (componentes-chave)

> Ajustar `font-sans` no `layout` para Inter/Geist. Os exemplos assumem utilitários Tailwind v3/v4 compatíveis.

### Page shell (esboço)

```tsx
<div className="min-h-dvh bg-[#F9FAFB] text-gray-900">
  <div className="flex min-h-0 min-h-dvh">
    {/* Sidebar 7.1 */}
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">…</aside>
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Top bar 7.2 */}
      <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4">…</header>
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto p-6">…</main>
        <aside className="hidden w-80 shrink-0 border-l border-gray-200 bg-white xl:block">…</aside>
      </div>
    </div>
  </div>
</div>
```

### Needs Attention (estrutura)

```tsx
<section className="rounded-xl border border-red-200 bg-red-50/90 p-5 shadow-sm">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-2">
      <span className="text-red-500">▲</span>
      <h2 className="text-sm font-semibold text-gray-900">Needs Attention</h2>
    </div>
    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">5</span>
  </div>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {/* mini-cards */}
  </div>
</section>
```

### Barra de progresso semântica

```tsx
function Progress({ value }: { value: number }) {
  const color =
    value >= 85 ? "bg-red-500" : value >= 60 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
```

### Nav item ativo (sidebar)

```tsx
<button
  type="button"
  className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-left text-sm font-medium text-gray-900"
>
  {/* icon + label */}
</button>
```

*(Para gráficos de área: usar SVG + path suave, ou lib leve; manter stroke 2px e gradiente vertical no fill.)*

---

## 9. Guia de expansão (novas funcionalidades)

Ao adicionar **billing**, **invoices**, **tickets** ou **monitorização avançada**:

1. **Reutilizar** `portal-bg-page`, cartão `white + border-gray-200 + shadow-sm`, e escala tipográfica `text-sm` / `text-xs` para tabelas densas.
2. **Nova página** = mesma shell (sidebar + top bar opcional) + título `text-display` + subtítulo `text-muted` + conteúdo em cartões alinhados à grelha `gap-6`.
3. **Estados de dinheiro / erro** usar `emerald`, `amber`, `red` com **texto sempre legível** (não só cor de fundo).
4. **Nenhum componente** com raio ou sombra diferente do padrão sem actualizar este documento.
5. **Formulários:** inputs `h-10`, `border-gray-200`, `focus:ring-2 focus:ring-blue-500/30`.

---

## 10. Plano de implementação (fases)

### Fase A — Fundação (tokens + layout)

- [ ] Criar ficheiro de tokens CSS: variáveis `--portal-*` em `globals.css` ou `portal-theme.css`.
- [ ] Configurar `fontFamily.sans` / `mono` no Tailwind para Inter + mono de dados.
- [ ] Componente `PortalShell`: sidebar + slot principal + opcional painel direito responsivo.

### Fase B — Navegação global

- [ ] `PortalSidebar` com grupos, item activo, rodapé utilizador.
- [ ] `PortalTopBar`: pesquisa + `Select`/dropdowns + CTA “Novo recurso”.
- [ ] Drawer mobile para sidebar (overlay + animação).

### Fase C — Dashboard (paridade com a imagem)

- [ ] `NeedsAttentionCard` + mini-grelha de alertas.
- [ ] `MetricAreaChartCard` ×3 (CPU / Memory / Network) com gradiente e labels temporais.
- [ ] `ServerGroupList`: secções PRODUCTION/STAGING + `ServerRow` com barras e menu.
- [ ] `ServerDetailsPanel` + `ActivityTimeline`.

### Fase D — Dados e integração

- [ ] Contratos TypeScript alinhados com API (servidores, métricas, alertas).
- [ ] Estados vazios e de carregamento (skeletons) no mesmo estilo visual.

### Fase E — Expansão

- [ ] Novas páginas (billing, tickets, …) usando apenas tokens + componentes da biblioteca.

---

## 11. Relação com o projeto Synthosia

- O site público pode continuar com o **DESIGN.md** (Cursor / warm minimalism).  
- A **Área do Cliente** (`/account` e futuras rotas `/portal/*`) deve seguir **este** sistema (Acme-like) para não misturar duas linguagens visuais.
- Próximo passo técnico recomendado: extrair tokens `--portal-*` e substituir gradualmente estilos locais em `account-workspace.tsx` pelos componentes da Fase B/C.

---

*Nota:* os hex podem ser refinados com eyedropper sobre a captura PNG de referência, para paridade absoluta com o original