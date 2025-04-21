export type ServerActionResult<T> =
  | {
      url?: any | string;
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      message: string;
    };
