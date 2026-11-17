import './styles/index.css';
import './components/fdCompo.style.css';

import { Button } from './components/button/fdCompo.button';
import { Badge } from './components/badge/fdCompo.badge';
import { Card } from './components/card/fdCompo.card';
import { Icon } from './components/icon/fdCompo.icon';
import { Input } from './components/input/fdCompo.input';
import { TextField } from './components/text-field/fdCompo.textField';

export * from './components/button/fdCompo.button';
export * from './components/badge/fdCompo.badge';
export * from './components/card/fdCompo.card';
export * from './components/icon/fdCompo.icon';
export * from './components/input/fdCompo.input';
export * from './components/text-field/fdCompo.textField';

export const fd = {
  Button,
  Badge,
  Card,
  Icon,
  Input,
  TextField,
} as const;
