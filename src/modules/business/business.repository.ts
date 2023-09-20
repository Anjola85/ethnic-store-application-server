import { DataSource, Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class BusinessRepository extends Repository<Business> {
  constructor(private dataSource: DataSource) {
    super(Business, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Business> {
    const business = await this.findBy({ name });

    if (typeof business === undefined) return null;

    return business[0];
  }
}
