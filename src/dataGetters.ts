import CSV from ".";
import detectRawDataType, { typesToParsers } from "./utils/types/detectRawDataType";

type FunctionReturn = unknown

interface ICollection {
    [name: string]: (args: unknown) => FunctionReturn
}

function value(this: CSV, { data, options }: any): FunctionReturn {
    const _value: any = {};
    this.fieldsIndex.forEach((index, position) => {
        let value = data.columns[index];
        if (value || !options.excludeEmpty) {
            const key = this.fields[position];
            const { types } = options;
            if (value) {
                const type = types && types[key] && typeof typesToParsers[types[key]] === 'function' ? types[key] : undefined;
                if (type) {
                    value = typesToParsers[type](value);
                }
            }
            _value[key] = value;
        }
    });
    return _value;
}


function pos({ data: { pos } }: any): FunctionReturn {
    return pos
}

function line({ data }: any): FunctionReturn {
    return data.line
}

function columns({ data }: any): FunctionReturn {
    return data.columns
}

const collection: ICollection = {
    value,
    pos,
    line,
    columns,
};

export default collection;