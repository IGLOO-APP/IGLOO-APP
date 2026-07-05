import { setCurrentAdminId } from './admin/auditService';
import { auditService } from './admin/auditService';
import { usersService } from './admin/usersService';
import { analyticsService } from './admin/analyticsService';
import { ticketsService } from './admin/ticketsService';
import { adminAnnouncementsService } from './admin/announcementsService';
import { teamService } from './admin/teamService';
import { templatesService } from './admin/templatesService';

export { setCurrentAdminId };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const merged: Record<string, any> = { setCurrentAdminId };

for (const svc of [
  auditService,
  usersService,
  analyticsService,
  ticketsService,
  adminAnnouncementsService,
  teamService,
  templatesService,
]) {
  for (const key of Object.keys(svc)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (svc as any)[key] === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merged[key] = (svc as any)[key].bind(svc);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merged[key] = (svc as any)[key];
    }
  }
}

export const adminService = merged as typeof auditService &
  typeof usersService &
  typeof analyticsService &
  typeof ticketsService &
  typeof adminAnnouncementsService &
  typeof teamService &
  typeof templatesService;
