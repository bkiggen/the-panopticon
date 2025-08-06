// export const OldShowtimesPage = () => {
//   return (
//     <Box sx={{ p: 3 }}>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={3}
//       >
//         <Typography variant="h4" component="h1">
//           Movie Events
//         </Typography>
//       </Box>

//       {error && (
//         <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
//           {error}
//         </Alert>
//       )}

//       {events.length === 0 && !loading ? (
//         <Typography variant="body1" color="text.secondary" textAlign="center">
//           No movie events found.
//         </Typography>
//       ) : (
//         <>
//           {/* Summary */}
//           <Box mb={3}>
//             <Typography variant="h6" gutterBottom>
//               Summary
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {events.length} events across {theatres.length} theatres
//             </Typography>
//             <Box mt={1}>
//               {theatres.map((theatre) => (
//                 <Chip
//                   key={theatre}
//                   label={`${theatre} (${
//                     eventsByTheatre[theatre]?.length || 0
//                   })`}
//                   variant="outlined"
//                   size="small"
//                   sx={{ mr: 1, mb: 1 }}
//                 />
//               ))}
//             </Box>
//           </Box>

//           {/* Events List */}
//           <Box>
//             {events.map((event: MovieEvent) => (
//               <Card key={event.id} sx={{ mb: 2 }}>
//                 <CardContent>
//                   <Box
//                     display="flex"
//                     justifyContent="between"
//                     alignItems="flex-start"
//                   >
//                     <Box flex={1}>
//                       <Typography variant="h6" component="h3" gutterBottom>
//                         {event.title}
//                       </Typography>

//                       {event.originalTitle !== event.title && (
//                         <Typography
//                           variant="body2"
//                           color="text.secondary"
//                           gutterBottom
//                         >
//                           Original: {event.originalTitle}
//                         </Typography>
//                       )}

//                       <Box mb={2}>
//                         <Typography variant="body2">
//                           <strong>Theatre:</strong> {event.theatre}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Date:</strong>{" "}
//                           {new Date(event.date).toLocaleDateString()}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Times:</strong> {event.times.join(", ")}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Format:</strong> {event.format}
//                         </Typography>
//                       </Box>

//                       {event.genres && event.genres.length > 0 && (
//                         <Box mb={1}>
//                           <Typography
//                             variant="body2"
//                             component="span"
//                             sx={{ mr: 1 }}
//                           >
//                             <strong>Genres:</strong>
//                           </Typography>
//                           {event.genres.map((genre, index) => (
//                             <Chip
//                               key={index}
//                               label={genre}
//                               size="small"
//                               variant="outlined"
//                               sx={{ mr: 0.5, mb: 0.5 }}
//                             />
//                           ))}
//                         </Box>
//                       )}

//                       {event.description && (
//                         <Typography
//                           variant="body2"
//                           color="text.secondary"
//                           paragraph
//                         >
//                           {event.description}
//                         </Typography>
//                       )}

//                       {event.accessibility &&
//                         event.accessibility.length > 0 && (
//                           <Box mb={1}>
//                             <Typography
//                               variant="body2"
//                               component="span"
//                               sx={{ mr: 1 }}
//                             >
//                               <strong>Accessibility:</strong>
//                             </Typography>
//                             {event.accessibility.map((feature, index) => (
//                               <Chip
//                                 key={index}
//                                 label={feature}
//                                 size="small"
//                                 color="info"
//                                 sx={{ mr: 0.5, mb: 0.5 }}
//                               />
//                             ))}
//                           </Box>
//                         )}

//                       {event.discount && event.discount.length > 0 && (
//                         <Box mb={1}>
//                           <Typography
//                             variant="body2"
//                             component="span"
//                             sx={{ mr: 1 }}
//                           >
//                             <strong>Discounts:</strong>
//                           </Typography>
//                           {event.discount.map((discount, index) => (
//                             <Chip
//                               key={index}
//                               label={discount}
//                               size="small"
//                               color="success"
//                               sx={{ mr: 0.5, mb: 0.5 }}
//                             />
//                           ))}
//                         </Box>
//                       )}
//                     </Box>

//                     {event.imageUrl && (
//                       <Box ml={2}>
//                         <img
//                           src={event.imageUrl}
//                           alt={event.ariaLabel || event.title}
//                           style={{
//                             width: 100,
//                             height: 150,
//                             objectFit: "cover",
//                             borderRadius: 4,
//                           }}
//                         />
//                       </Box>
//                     )}
//                   </Box>

//                   <Box mt={2} display="flex" gap={1}>
//                     {event.trailerUrl && (
//                       <Button
//                         size="small"
//                         variant="outlined"
//                         href={event.trailerUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         Trailer
//                       </Button>
//                     )}

//                     {event.imdbId && (
//                       <Button
//                         size="small"
//                         variant="outlined"
//                         href={`https://www.imdb.com/title/${event.imdbId}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         IMDB
//                       </Button>
//                     )}

//                     <Button
//                       size="small"
//                       variant="outlined"
//                       color="error"
//                       onClick={() => handleDelete(event.id)}
//                     >
//                       Delete
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             ))}
//           </Box>
//         </>
//       )}
//     </Box>
//   );
// };
