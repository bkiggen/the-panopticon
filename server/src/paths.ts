import moduleAlias from "module-alias";
import path from "path";

// Add alias for runtime resolution
moduleAlias.addAliases({
  "@": path.join(__dirname, "./"),
});
