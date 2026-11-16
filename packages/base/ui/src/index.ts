import './styles/index.css';

import { Button } from './components/button/fdCompo.button';
import { Badge } from './components/badge/fdCompo.badge';
import { Card } from './components/card/fdCompo.card';

export * from './components/button/fdCompo.button';
export * from './components/badge/fdCompo.badge';
export * from './components/card/fdCompo.card';

export const fd = {
  Button,
  Badge,
  Card,
} as const;
