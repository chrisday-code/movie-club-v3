import "ldrs/helix";
import { bouncy } from "ldrs";
import { useTheme } from "@mui/material/styles";
bouncy.register();

export const Loader = () => {
  const theme = useTheme();
  return (
    <l-bouncy
      size="45"
      speed="1.75"
      color={theme.palette.primary.main}
    ></l-bouncy>
  );
};
