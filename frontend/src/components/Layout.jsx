import {Box, Container} from "@mui/material";

export default function Layout({children}) {
    return (
        <Box component="main" sx={{py: {xs: 3, md: 4}}}>
            <Container maxWidth="lg">{children}</Container>
        </Box>
    );
}
