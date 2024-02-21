import { FindOptionsWhere, Repository } from 'typeorm';
import { GenericFilter } from './generic-filter';
import { SortOrder } from './sort-order';

export class PageService {
  /**
   *
   * @param filter
   * @returns
   */
  protected createOrderQuery(filter: GenericFilter) {
    const order: any = {};

    if (filter.orderBy) {
      order[filter.orderBy] = filter.sortOrder;
      return order;
    }

    order.createdAt = SortOrder.DESC;
    return order;
  }

  /**
   * This method is used to paginate the data from the repository
   * @param repository
   * @param filter
   * @param where
   * @returns
   */
  protected paginate<T>(
    repository: Repository<T>,
    filter: GenericFilter,
    where: FindOptionsWhere<T>,
  ) {
    return repository.findAndCount({
      order: this.createOrderQuery(filter),
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
      where: where,
    });
  }
}
