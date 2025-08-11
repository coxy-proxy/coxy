import { Check } from 'lucide-react';
import { Badge } from '@/shared/ui/components/badge';

export default function DefaultKeyBadge() {
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/90">
      <Check className="size-3" />
      Default
    </Badge>
  );
}
