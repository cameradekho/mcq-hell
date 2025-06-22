export type ServerActionResult<T> =
  | {
      url?: any | string;
      success: true;
      data: T;
      message?: string;
      pagination?: {
        page: number;
        limit: number;
        totalPages: number;
        totalCount: number;
      };
    }
  | {
      success: false;
      message: string;
    };
