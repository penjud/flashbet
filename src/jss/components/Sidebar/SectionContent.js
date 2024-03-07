import MultiAccordionSummary from '@mui/material/AccordionSummary';
import { withStyles } from '@mui/material/styles';

const SectionContent = withStyles((theme) => ({
  root: {
    margin: theme.spacing(0, 2),
    padding: '0',
    zIndex: '1',
    '&$expanded': {
      minHeight: '0px',
    },
  },
  expanded: {
    minHeight: '0px',
  },
}))(MultiAccordionSummary);

export default SectionContent;
