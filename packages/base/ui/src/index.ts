import './styles/index.css';

import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Card } from './components/Card';

export * from './components/Button';
export * from './components/Badge';
export * from './components/Card';

export const fd = {
  Button,
  Badge,
  Card,
} as const;
