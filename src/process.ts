export default class CssRpxProcess {

    constructor(private config: any) {}

    private rePxReg: RegExp = /(\d+(\.\d+)?)(px)?/;

    private rePxAllReg: RegExp = /(\d+(\.\d+)?)px/g;

    private pxToRpx(pxStr: string) {
        const px = parseFloat(pxStr);

        let rpxValue: number | string = +(px * (750 / this.config.baseWidth)).toFixed(this.config.fixedDigits);
        if (this.config.autoRemovePrefixZero) {
            if (rpxValue.toString().startsWith('0.')) {
                rpxValue = rpxValue.toString().substring(1);
            }
        }
        return {px: pxStr, pxValue: px, rpxValue, rpx: rpxValue + 'rpx'};
    }

    convert(text: string) {
        let match = text.match(this.rePxReg);
        if (!match) {
            return null;
        }
        return this.pxToRpx(match[1]);
    }

    convertAll(code:string, start:number) {
        if (!code) {
            return {
                text: code,
                arr: []
            };
        }

        // 记录本次修改的位置
        let match;
        const arr:any = [];
        while(match = this.rePxAllReg.exec(code)) {
            arr.push({
                index: match.index + start,
                length: 0
            });
        }

        let index = 0;
        let offset = 0;
        const result = code.replace(this.rePxAllReg, (word:string) => {
            console.log(word);
            const res = this.pxToRpx(word);
            if (res) {
                const temp = arr[index];
                arr[index++] = {
                    index: temp.index + offset,
                    length: res.rpx.length
                };
                offset += (res.rpx.length - word.length);
                return res.rpx;
            }
            return word;
        });

        return {
            text: result,
            arr,
        };
    }
}