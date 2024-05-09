import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export const Score = (props: any) => {
  return (
    <Box
      component={motion.div}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      // layout="opacity"
      sx={{
        position: "absolute",
        backgroundColor: "white",
        marginTop: "-20px",
        marginLeft: "55px",
        border: "1px solid",
        width: "34px",
        height: "34px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
      }}
    >
      <Typography
        variant="body1"
        fontWeight={800}
        sx={{ padding: "0", margin: "0" }}
      >
        {" "}
        {props.score.toPrecision(3)}
      </Typography>
    </Box>
  );
};
