import { List } from '../../data/models/list';
import { IReorderService } from '../../services/reorder.interface';
import { ReorderService } from '../../services/reorder.service';
import { LoggerFactory } from '../observer';

// PATTERN: Proxy
export class ReorderServiceProxy implements IReorderService {
  private target: ReorderService;
  private logger = LoggerFactory.getInstance();

  constructor(target: ReorderService) {
    this.target = target;
  }

  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    this.logger.info(`ReorderService.reorder called`, {
      method: 'reorder',
      parameters: {
        itemsLength: items.length,
        startIndex,
        endIndex,
      },
      timestamp: new Date().toISOString(),
    });

    return this.target.reorder(items, startIndex, endIndex);
  }

  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    this.logger.info(`ReorderService.reorderCards called`, {
      method: 'reorderCards',
      parameters: {
        listsCount: lists.length,
        sourceIndex,
        destinationIndex,
        sourceListId,
        destinationListId,
      },
      timestamp: new Date().toISOString(),
    });

    return this.target.reorderCards({
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    });
  }
}
