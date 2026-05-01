const VOCAB_WORDS = [
  { word: 'articulate', meaning: 'To express clearly and effectively', example: '"She articulated her ideas during the meeting."', known: false, category: 'Professional' },
  { word: 'elaborate', meaning: 'To explain in more detail', example: '"Could you elaborate on your proposal?"', known: true, category: 'Professional' },
  { word: 'hesitant', meaning: 'Uncertain or slow to act', example: '"He was hesitant to share his opinion."', known: false, category: 'General' },
  { word: 'concise', meaning: 'Brief but comprehensive', example: '"Keep your answers concise in interviews."', known: true, category: 'Professional' },
  { word: 'delegate', meaning: 'To assign responsibility to someone', example: '"A good manager knows how to delegate tasks."', known: false, category: 'Business' },
  { word: 'feasible', meaning: 'Possible and practical to do', example: '"Is this timeline feasible for the project?"', known: false, category: 'Business' },
  { word: 'nuance', meaning: 'A subtle difference in meaning', example: '"Understanding nuance helps you sound natural."', known: true, category: 'General' },
  { word: 'proficient', meaning: 'Competent or skilled', example: '"She became proficient in English after six months."', known: false, category: 'General' },
];

function VocabularyPage() {
  const [words, setWords] = React.useState(VOCAB_WORDS);
  const [filter, setFilter] = React.useState('All');
  const [mode, setMode] = React.useState('list'); // list | flashcard
  const [cardIdx, setCardIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  const cats = ['All', 'Professional', 'Business', 'General'];
  const filtered = filter === 'All' ? words : words.filter(w => w.category === filter);
  const knownCount = words.filter(w => w.known).length;

  function toggleKnown(word) {
    setWords(ws => ws.map(w => w.word === word ? { ...w, known: !w.known } : w));
  }

  const card = filtered[cardIdx] || filtered[0];

  return (
    <div>
      <PageTitle label="Vocabulary" title="Words from your sessions" subtitle="Review and reinforce vocabulary flagged during your conversations." />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        <PillTabs tabs={cats} active={filter} onChange={v => { setFilter(v); setCardIdx(0); setFlipped(false); }} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setMode('list')} style={{
            padding: '8px 16px', borderRadius: 8, border: `1px solid ${mode === 'list' ? T.indigo : T.border}`,
            background: mode === 'list' ? T.indigoLight : 'transparent',
            color: mode === 'list' ? T.indigo : T.body, cursor: 'pointer',
            fontFamily: T.bodyFont, fontSize: 13, fontWeight: 500,
          }}>List</button>
          <button onClick={() => { setMode('flashcard'); setCardIdx(0); setFlipped(false); }} style={{
            padding: '8px 16px', borderRadius: 8, border: `1px solid ${mode === 'flashcard' ? T.indigo : T.border}`,
            background: mode === 'flashcard' ? T.indigoLight : 'transparent',
            color: mode === 'flashcard' ? T.indigo : T.body, cursor: 'pointer',
            fontFamily: T.bodyFont, fontSize: 13, fontWeight: 500,
          }}>Flashcards</button>
        </div>
      </div>

      <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.bodyLight, marginBottom: 20 }}>
        {knownCount} of {words.length} words marked as known
        <ProgressBar value={knownCount} max={words.length} color={T.green} />
      </div>

      {mode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(w => (
            <AppCard key={w.word} hover={false} style={{ padding: '16px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading }}>{w.word}</span>
                    <Badge color={w.category === 'Business' ? T.orange : T.indigo}>{w.category}</Badge>
                  </div>
                  <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, marginBottom: 4 }}>{w.meaning}</div>
                  <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, fontStyle: 'italic' }}>{w.example}</div>
                </div>
                <button onClick={() => toggleKnown(w.word)} style={{
                  padding: '8px 16px', borderRadius: 8, border: `1px solid ${w.known ? T.green : T.border}`,
                  background: w.known ? `${T.green}15` : 'transparent',
                  color: w.known ? T.green : T.body, cursor: 'pointer',
                  fontFamily: T.bodyFont, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                }}>{w.known ? '✓ Known' : 'Mark Known'}</button>
              </div>
            </AppCard>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 20 }}>
          {card && (
            <div onClick={() => setFlipped(!flipped)} style={{
              width: '100%', maxWidth: 440, minHeight: 240, cursor: 'pointer',
              perspective: 1000, position: 'relative',
            }}>
              <div style={{
                background: flipped ? T.white : `linear-gradient(135deg, ${T.indigo}, oklch(0.45 0.22 275))`,
                borderRadius: 20, padding: 36, textAlign: 'center',
                border: `1px solid ${T.border}`,
                boxShadow: '0 12px 40px oklch(0.55 0.22 275 / 0.12)',
                transition: 'all 0.4s ease',
                transform: flipped ? 'rotateY(0)' : 'rotateY(0)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240,
              }}>
                {!flipped ? (
                  <React.Fragment>
                    <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 32, color: T.white }}>{card.word}</div>
                    <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 12 }}>Tap to reveal meaning</div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 24, color: T.heading, marginBottom: 8 }}>{card.word}</div>
                    <div style={{ fontFamily: T.bodyFont, fontSize: 16, color: T.body, marginBottom: 12 }}>{card.meaning}</div>
                    <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.bodyLight, fontStyle: 'italic' }}>{card.example}</div>
                  </React.Fragment>
                )}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <BtnSecondary onClick={() => { setCardIdx(Math.max(0, cardIdx - 1)); setFlipped(false); }}
              style={{ padding: '10px 20px' }}>← Prev</BtnSecondary>
            <span style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.bodyLight }}>{cardIdx + 1} / {filtered.length}</span>
            <BtnSecondary onClick={() => { setCardIdx(Math.min(filtered.length - 1, cardIdx + 1)); setFlipped(false); }}
              style={{ padding: '10px 20px' }}>Next →</BtnSecondary>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <BtnPrimary onClick={() => { if(card) toggleKnown(card.word); }} style={{ padding: '10px 20px', fontSize: 14 }}>
              {card?.known ? 'Unmark Known' : '✓ I Know This'}
            </BtnPrimary>
          </div>
        </div>
      )}
    </div>
  );
}

window.VocabularyPage = VocabularyPage;
