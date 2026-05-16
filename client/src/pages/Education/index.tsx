import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { classes } from './data/classes';

const GOLD = '#c9a84c';

export const Education = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        mx: '-2rem',
        mt: '-2rem',
        textAlign: 'left',
        backgroundColor: '#080808',
        minHeight: '100vh',
        color: '#f0f0f0',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: '32px', md: '80px' },
          pt: { xs: '80px', md: '120px' },
          pb: { xs: '60px', md: '80px' },
          borderBottom: '1px solid #161616',
          position: 'relative',
        }}
      >
        <Box
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            top: 28,
            left: { xs: '32px', md: '80px' },
            cursor: 'pointer',
            fontFamily: 'Antonio, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#383838',
            transition: 'color 0.2s',
            '&:hover': { color: GOLD },
          }}
        >
          ← Dr. Movie Times
        </Box>

        <Typography
          sx={{
            fontFamily: 'Antonio, sans-serif',
            fontSize: { xs: '10px', md: '11px' },
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: GOLD,
            mb: 3,
          }}
        >
          Movie Madness University
        </Typography>

        <Typography
          sx={{
            fontFamily: 'Antonio, sans-serif',
            fontSize: { xs: '60px', md: '108px', lg: '128px' },
            fontWeight: 700,
            textTransform: 'uppercase',
            lineHeight: 0.86,
            letterSpacing: '-0.035em',
            mb: 5,
          }}
        >
          Film
          <br />
          Education
        </Typography>

        <Typography
          sx={{
            fontFamily: 'Lato, sans-serif',
            fontSize: { xs: '15px', md: '18px' },
            color: '#555',
            fontWeight: 300,
            maxWidth: '420px',
            lineHeight: 1.75,
          }}
        >
          A series of classes on cinema, history, and the ideas that make films
          worth watching twice.
        </Typography>
      </Box>

      {/* Class list */}
      {classes.map((cls) => (
        <Box
          key={cls.id}
          onClick={() => navigate(`/education/${cls.id}`)}
          sx={{
            display: 'flex',
            gap: { xs: '20px', md: '52px' },
            px: { xs: '32px', md: '80px' },
            py: { xs: '52px', md: '72px' },
            borderBottom: '1px solid #161616',
            cursor: 'pointer',
            transition: 'background 0.35s ease',
            '&:hover': {
              backgroundColor: '#0e0e0e',
              '& .view-label': { color: GOLD, transform: 'translateX(6px)' },
            },
          }}
        >
          {/* Number */}
          <Typography
            sx={{
              fontFamily: 'Antonio, sans-serif',
              fontSize: { xs: '13px', md: '14px' },
              fontWeight: 700,
              color: GOLD,
              letterSpacing: '0.1em',
              pt: { xs: '6px', md: '14px' },
              flexShrink: 0,
              minWidth: '28px',
            }}
          >
            {cls.number}
          </Typography>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: '28px', md: '56px' },
                alignItems: 'flex-start',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {/* Poster */}
              <Box
                sx={{
                  width: { xs: '110px', md: '130px' },
                  aspectRatio: '2/3',
                  border: '1px solid #1c1c1c',
                  flexShrink: 0,
                  backgroundColor: '#0c0c0c',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
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
                    <Box
                      sx={{
                        width: '28px',
                        height: '28px',
                        border: `1px solid #252525`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '10px', color: '#252525', lineHeight: 1 }}>
                        ▶
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: 'Lato, sans-serif',
                        fontSize: '8px',
                        letterSpacing: '0.22em',
                        color: '#252525',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        lineHeight: 1.8,
                      }}
                    >
                      Movie
                      <br />
                      Poster
                    </Typography>
                  </>
                )}
              </Box>

              {/* Text */}
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Antonio, sans-serif',
                    fontSize: { xs: '10px', md: '11px' },
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#3a3a3a',
                    mb: 1.5,
                  }}
                >
                  {cls.film} · {cls.director} · {cls.year}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: 'Antonio, sans-serif',
                    fontSize: { xs: '32px', md: '56px' },
                    fontWeight: 700,
                    lineHeight: 0.93,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    color: '#f0f0f0',
                    mb: 0.5,
                  }}
                >
                  {cls.title}
                </Typography>

                {cls.subtitle && (
                  <Typography
                    sx={{
                      fontFamily: 'Lato, sans-serif',
                      fontSize: { xs: '13px', md: '16px' },
                      color: '#484848',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      mb: 3,
                    }}
                  >
                    {cls.subtitle}
                  </Typography>
                )}

                <Typography
                  sx={{
                    fontFamily: 'Lato, sans-serif',
                    fontSize: { xs: '14px', md: '15px' },
                    color: '#5a5a5a',
                    lineHeight: 1.8,
                    maxWidth: '500px',
                    fontWeight: 300,
                    mb: 3.5,
                  }}
                >
                  {cls.teaser}
                </Typography>

                <Typography
                  className="view-label"
                  sx={{
                    fontFamily: 'Antonio, sans-serif',
                    fontSize: '11px',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: '#3a3a3a',
                    transition: 'color 0.25s, transform 0.25s',
                    display: 'inline-block',
                  }}
                >
                  View Outline →
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      ))}

      {/* Footer */}
      <Box
        sx={{
          px: { xs: '32px', md: '80px' },
          py: 5,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Antonio, sans-serif',
            fontSize: '10px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#1e1e1e',
          }}
        >
          Movie Madness University · Film Education for the Public
        </Typography>
      </Box>
    </Box>
  );
};
