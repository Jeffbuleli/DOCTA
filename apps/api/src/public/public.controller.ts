import { Controller, Get, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly pub: PublicService) {}

  // Annuaire public des hopitaux (pas d'authentification).
  @Get('hospitals')
  hospitals(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('q') q?: string,
  ) {
    const latN = lat !== undefined ? Number(lat) : undefined;
    const lngN = lng !== undefined ? Number(lng) : undefined;
    return this.pub.hospitals(
      Number.isFinite(latN) ? latN : undefined,
      Number.isFinite(lngN) ? lngN : undefined,
      q,
    );
  }
}
