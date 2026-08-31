import React from 'react';
import {
  Zap, Droplet, Wind, Paintbrush, Grid, Hammer, Lock, Wrench, Sparkles,
  Lightbulb, Fuel, Camera, type LucideIcon,
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  droplet: Droplet,
  wind: Wind,
  paintbrush: Paintbrush,
  grid: Grid,
  hammer: Hammer,
  lock: Lock,
  wrench: Wrench,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  fuel: Fuel,
  camera: Camera,
};

// دالة جلب الأيقونة حسب الاسم
export function getServiceIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName?.toLowerCase()] || Wrench;
}

// مكون React لعرض الأيقونة مباشرة
interface ServiceIconProps {
  name?: string;
  color?: string;
  size?: number;
}

export function ServiceIcon({ name = '', color = '#2563eb', size = 24 }: ServiceIconProps) {
  const IconComponent = getServiceIcon(name);
  return <IconComponent color={color} size={size} />;
}

export default ServiceIcon;
