import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Collapse, Typography } from '@mui/material';
import { classes, type OutlineItem, type OutlineSection } from './data/classes';

const GOLD = '#c9a84c';
const BG = '#080808';

// ─── YouTube embed helper ──────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ─── Accordion ID helpers ──────────────────────────────────────────────────────
// IDs are path strings: "sectionId/itemIdx/subIdx/..." so each accordion is unique.

function collectAllAccordionIds(items: OutlineItem[], prefix: string): string[] {
  const ids: string[] = [];
  items.forEach((item, i) => {
    if (item.items?.length) {
      const id = `${prefix}/${i}`;
      ids.push(id);
      ids.push(...collectAllAccordionIds(item.items, id));
    }
  });
  return ids;
}

// ─── Recursive item renderer ───────────────────────────────────────────────────
// depth 0 = direct children of a section
// depth 1 = inside a level-0 accordion
// depth 2+ = deeper nesting

function renderOutlineItem(
  item: OutlineItem,
  id: string,
  depth: number,
  expanded: Record<string, boolean>,
  onToggle: (id: string) => void,
): React.ReactNode {
  // YouTube embed
  if (item.text.startsWith('Embed: ')) {
    const videoId = getYouTubeId(item.text.slice(7).trim());
    if (videoId) {
      return (
        <Box sx={{ width: '100%', aspectRatio: '16/9', my: 1, border: '1px solid #1c1c1c', overflow: 'hidden' }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block' }}
          />
        </Box>
      );
    }
  }

  const isAccordion = !!item.items?.length;
  const isOpen = !!expanded[id];

  // Font sizes scale down with depth but stay readable for projection
  const textSize =
    depth === 0
      ? { xs: '17px', md: '19px' }
      : depth === 1
      ? { xs: '15px', md: '17px' }
      : { xs: '14px', md: '15px' };

  const textColor = depth === 0 ? '#c4c4c4' : depth === 1 ? '#999' : '#777';
  const headerColor = depth === 0 ? '#efefef' : depth === 1 ? '#d4d4d4' : '#b8b8b8';
  const triangleColor = depth === 0 ? GOLD : depth === 1 ? '#666' : '#484848';
  const borderColor = depth === 0 ? '#252525' : depth === 1 ? '#1c1c1c' : '#181818';
  const itemGap = depth === 0 ? '26px' : depth === 1 ? '14px' : '10px';
  const indentML = depth === 0 ? '20px' : '16px';
  const indentPL = depth === 0 ? '20px' : '16px';
  const triangleSize = depth === 0 ? '11px' : depth === 1 ? '10px' : '9px';
  const headerSize = depth === 0 ? { xs: '18px', md: '21px' } : depth === 1 ? { xs: '15px', md: '17px' } : { xs: '14px', md: '15px' };

  if (!isAccordion) {
    return (
      <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <Typography
          sx={{
            color: depth === 0 ? GOLD : '#383838',
            fontSize: depth === 0 ? '18px' : '14px',
            lineHeight: '1.85',
            flexShrink: 0,
            fontFamily: 'Lato, sans-serif',
            mt: '-1px',
          }}
        >
          —
        </Typography>
        <Typography
          sx={{
            fontFamily: 'Lato, sans-serif',
            fontSize: textSize,
            lineHeight: 1.85,
            color: textColor,
            fontWeight: 300,
          }}
        >
          {item.text}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Accordion header */}
      <Box
        onClick={() => onToggle(id)}
        sx={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          cursor: 'pointer',
          py: '3px',
          '&:hover .acc-triangle': { color: GOLD },
          '&:hover .acc-text': { color: GOLD },
        }}
      >
        <Typography
          className="acc-triangle"
          sx={{
            color: triangleColor,
            fontSize: triangleSize,
            lineHeight: '2.0',
            flexShrink: 0,
            transition: 'transform 0.22s ease, color 0.18s',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            display: 'inline-block',
            mt: depth === 0 ? '2px' : '1px',
          }}
        >
          ▶
        </Typography>
        <Typography
          className="acc-text"
          sx={{
            fontFamily: 'Antonio, sans-serif',
            fontSize: headerSize,
            lineHeight: 1.35,
            color: headerColor,
            fontWeight: 600,
            letterSpacing: depth === 0 ? '0.04em' : '0.02em',
            textTransform: depth === 0 ? 'uppercase' : 'none',
            transition: 'color 0.18s',
          }}
        >
          {item.text}
        </Typography>
      </Box>

      {/* Collapsible content */}
      <Collapse in={isOpen} timeout={220}>
        <Box
          sx={{
            ml: indentML,
            pl: indentPL,
            borderLeft: `1px solid ${borderColor}`,
            mt: '10px',
            mb: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: itemGap,
          }}
        >
          {item.items!.map((child, i) => (
            <Box key={`${id}/${i}`}>
              {renderOutlineItem(child, `${id}/${i}`, depth + 1, expanded, onToggle)}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Section block ─────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: OutlineSection;
  idx: number;
  onRef: (el: HTMLDivElement | null) => void;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
}

const SectionBlock = ({ section, idx, onRef, expanded, onToggle }: SectionBlockProps) => {
  const [visible, setVisible] = useState(false);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.06 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={(el: HTMLDivElement | null) => {
        innerRef.current = el;
        onRef(el);
      }}
      sx={{
        minHeight: '100vh',
        px: { xs: '32px', md: '88px', lg: '112px' },
        py: { xs: '80px', md: '120px' },
        borderBottom: '1px solid #111',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: idx % 2 === 0 ? BG : '#0a0a0a',
      }}
    >
      {/* Watermark numeral */}
      <Typography
        sx={{
          position: 'absolute',
          top: '-0.1em',
          right: '-0.04em',
          fontFamily: 'Antonio, sans-serif',
          fontSize: { xs: '38vw', md: '24vw' },
          fontWeight: 700,
          color: 'rgba(255,255,255,0.022)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.02em',
        }}
      >
        {section.numeral}
      </Typography>

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '780px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.75s ease, transform 0.75s ease',
        }}
      >
        {/* Section header */}
        <Box sx={{ mb: { xs: 5, md: 7 } }}>
          <Typography
            sx={{
              fontFamily: 'Antonio, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.36em',
              textTransform: 'uppercase',
              color: GOLD,
              mb: 2.5,
            }}
          >
            {section.numeral}
            {section.timing ? ` · ${section.timing}` : ''}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'Antonio, sans-serif',
              fontSize: { xs: '28px', md: '50px', lg: '60px' },
              fontWeight: 700,
              lineHeight: 0.94,
              letterSpacing: '-0.015em',
              textTransform: 'uppercase',
              color: '#f0f0f0',
              mb: 4,
            }}
          >
            {section.title}
          </Typography>

          <Box sx={{ width: '28px', height: '2px', backgroundColor: GOLD }} />
        </Box>

        {/* Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {section.items.map((item, i) => (
            <Box key={`${section.id}/${i}`}>
              {renderOutlineItem(item, `${section.id}/${i}`, 0, expanded, onToggle)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const cls = classes.find((c) => c.id === classId);

  // Sidebar scroll tracking
  const [activeSection, setActiveSection] = useState('hero');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const ratios = useRef<Record<string, number>>({});

  // Accordion expand/collapse state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const allAccordionIds = useMemo(() => {
    if (!cls) return [];
    return cls.sections.flatMap((s) => collectAllAccordionIds(s.items, s.id));
  }, [cls]);

  const expandAll = () =>
    setExpanded(Object.fromEntries(allAccordionIds.map((id) => [id, true])));
  const collapseAll = () => setExpanded({});
  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const isAnyExpanded = allAccordionIds.some((id) => expanded[id]);

  // Intersection observer for sidebar
  useEffect(() => {
    if (!cls) return;
    const allIds = ['hero', ...cls.sections.map((s) => s.id)];
    const observers: IntersectionObserver[] = [];

    allIds.forEach((id) => {
      const el = sectionRefs.current[id];
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          ratios.current[id] = entry.intersectionRatio;
          let maxRatio = -1;
          let maxId = allIds[0];
          for (const [sid, r] of Object.entries(ratios.current)) {
            if (r > maxRatio) { maxRatio = r; maxId = sid; }
          }
          setActiveSection(maxId);
        },
        { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [cls]);

  const scrollTo = (id: string) =>
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });

  if (!cls) {
    navigate('/education');
    return null;
  }

  const allDots = [
    { id: 'hero', numeral: '·' },
    ...cls.sections.map((s) => ({ id: s.id, numeral: s.numeral })),
  ];

  return (
    <Box
      sx={{
        mx: '-2rem',
        mt: '-2rem',
        textAlign: 'left',
        backgroundColor: BG,
        color: '#f0f0f0',
        minHeight: '100vh',
      }}
    >
      {/* ── Fixed expand / collapse control ── */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 2000,
          display: 'flex',
          border: '1px solid #222',
          backgroundColor: '#0d0d0d',
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={expandAll}
          sx={{
            px: '14px',
            py: '9px',
            cursor: 'pointer',
            fontFamily: 'Antonio, sans-serif',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: isAnyExpanded ? '#3a3a3a' : GOLD,
            transition: 'color 0.2s, background 0.2s',
            '&:hover': { backgroundColor: '#141414', color: GOLD },
          }}
        >
          Expand All
        </Box>
        <Box sx={{ width: '1px', backgroundColor: '#222' }} />
        <Box
          onClick={collapseAll}
          sx={{
            px: '14px',
            py: '9px',
            cursor: 'pointer',
            fontFamily: 'Antonio, sans-serif',
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: isAnyExpanded ? GOLD : '#3a3a3a',
            transition: 'color 0.2s, background 0.2s',
            '&:hover': { backgroundColor: '#141414', color: GOLD },
          }}
        >
          Collapse All
        </Box>
      </Box>

      <Box sx={{ display: 'flex' }}>

        {/* ── Sticky sidebar ── */}
        <Box
          sx={{
            width: { xs: 0, md: '72px' },
            flexShrink: 0,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: '50vh',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              py: 3,
            }}
          >
            {allDots.map(({ id, numeral }) => {
              const isActive = activeSection === id;
              return (
                <Box
                  key={id}
                  onClick={() => scrollTo(id)}
                  title={
                    id === 'hero'
                      ? cls.title
                      : cls.sections.find((s) => s.id === id)?.title
                  }
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover .dot': { backgroundColor: GOLD, width: '8px', height: '8px' },
                    '&:hover .dot-label': { opacity: 1, transform: 'translateX(0)' },
                  }}
                >
                  <Box
                    className="dot"
                    sx={{
                      width: isActive ? '8px' : '4px',
                      height: isActive ? '8px' : '4px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? GOLD : '#282828',
                      border: isActive ? 'none' : '1px solid #303030',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Typography
                    className="dot-label"
                    sx={{
                      position: 'absolute',
                      left: '16px',
                      fontFamily: 'Antonio, sans-serif',
                      fontSize: '9px',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: GOLD,
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      transform: 'translateX(-4px)',
                      transition: 'opacity 0.2s, transform 0.2s',
                      pointerEvents: 'none',
                    }}
                  >
                    {numeral}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Main content ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* ── HERO ── */}
          <Box
            ref={(el: HTMLDivElement | null) => { sectionRefs.current['hero'] = el; }}
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              px: { xs: '32px', md: '80px' },
              py: '120px',
              borderBottom: '1px solid #111',
              position: 'relative',
              background: 'radial-gradient(ellipse at 50% -10%, #161616 0%, #080808 55%)',
            }}
          >
            <Box
              onClick={() => navigate('/education')}
              sx={{
                position: 'absolute',
                top: 32,
                left: { xs: '32px', md: '40px' },
                cursor: 'pointer',
                fontFamily: 'Antonio, sans-serif',
                fontSize: '11px',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#383838',
                transition: 'color 0.2s',
                '&:hover': { color: GOLD },
              }}
            >
              ← Education
            </Box>

            <Typography
              sx={{
                fontFamily: 'Antonio, sans-serif',
                fontSize: '11px',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: GOLD,
                mb: 5,
              }}
            >
              Movie Madness University
            </Typography>

            {/* Poster placeholder */}
            <Box
              sx={{
                width: { xs: '148px', md: '176px' },
                aspectRatio: '2/3',
                border: '1px solid #1c1c1c',
                backgroundColor: '#0c0c0c',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 7,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {cls.posterSrc ? (
                <img
                  src={cls.posterSrc}
                  alt={cls.film}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <>
                  <Box sx={{ position: 'absolute', top: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'space-evenly', px: '8px' }}>
                    {[...Array(4)].map((_, i) => (
                      <Box key={i} sx={{ width: '5px', height: '5px', borderRadius: '1px', backgroundColor: '#181818' }} />
                    ))}
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'space-evenly', px: '8px' }}>
                    {[...Array(4)].map((_, i) => (
                      <Box key={i} sx={{ width: '5px', height: '5px', borderRadius: '1px', backgroundColor: '#181818' }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontFamily: 'Antonio, sans-serif', fontSize: '24px', color: '#1e1e1e', mb: 1.5 }}>▶</Typography>
                  <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '8px', letterSpacing: '0.24em', color: '#222', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.9 }}>
                    Movie<br />Poster
                  </Typography>
                </>
              )}
            </Box>

            <Typography
              sx={{
                fontFamily: 'Antonio, sans-serif',
                fontSize: { xs: '38px', md: '76px', lg: '92px' },
                fontWeight: 700,
                lineHeight: 0.91,
                letterSpacing: '-0.025em',
                textTransform: 'uppercase',
                mb: 2.5,
                maxWidth: '820px',
              }}
            >
              {cls.title}
            </Typography>

            {cls.subtitle && (
              <Typography
                sx={{
                  fontFamily: 'Lato, sans-serif',
                  fontSize: { xs: '14px', md: '19px' },
                  color: '#585858',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  mb: 5,
                }}
              >
                {cls.subtitle}
              </Typography>
            )}

            <Box sx={{ width: '36px', height: '1px', backgroundColor: GOLD, mb: 4 }} />

            <Typography
              sx={{
                fontFamily: 'Antonio, sans-serif',
                fontSize: '12px',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#3c3c3c',
              }}
            >
              {cls.film} · Directed by {cls.director} · {cls.year}
            </Typography>

            <Box
              sx={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Typography sx={{ fontFamily: 'Antonio, sans-serif', fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#242424' }}>
                Scroll
              </Typography>
              <Box
                sx={{
                  width: '1px',
                  height: '36px',
                  background: `linear-gradient(to bottom, ${GOLD}55, transparent)`,
                  animation: 'pulseDown 1.8s ease-in-out infinite',
                  '@keyframes pulseDown': {
                    '0%, 100%': { opacity: 0.3, transform: 'scaleY(0.6)', transformOrigin: 'top' },
                    '50%': { opacity: 1, transform: 'scaleY(1)', transformOrigin: 'top' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* ── Section blocks ── */}
          {cls.sections.map((section, idx) => (
            <SectionBlock
              key={section.id}
              section={section}
              idx={idx}
              onRef={(el) => { sectionRefs.current[section.id] = el; }}
              expanded={expanded}
              onToggle={toggle}
            />
          ))}

          {/* ── Footer ── */}
          <Box sx={{ px: { xs: '32px', md: '80px' }, py: { xs: '60px', md: '80px' }, textAlign: 'center', borderTop: '1px solid #0f0f0f' }}>
            <Typography sx={{ fontFamily: 'Antonio, sans-serif', fontSize: '10px', letterSpacing: '0.34em', textTransform: 'uppercase', color: '#1e1e1e', mb: 3 }}>
              Movie Madness University
            </Typography>
            <Box
              onClick={() => navigate('/education')}
              sx={{ cursor: 'pointer', fontFamily: 'Antonio, sans-serif', fontSize: '11px', letterSpacing: '0.26em', textTransform: 'uppercase', color: '#383838', transition: 'color 0.2s', '&:hover': { color: GOLD }, display: 'inline-block' }}
            >
              ← All Classes
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
