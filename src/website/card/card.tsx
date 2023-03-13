// ** MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

const AppCard = ({children, title}: any) => {
  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Typography variant='h6'>{title}</Typography>
        {children}
      </CardContent>
    </Card>
  )
}

export default AppCard;
