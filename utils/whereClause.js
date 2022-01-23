class WhereClause{
    constructor(base, bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }

    //search we find the search keyword in the bigQuery
    search(){

        const searchword = this.bigQ.search ? {
            // if searchword exist the look in name / description
            // name: {searchword} this wroks but we will go for regex one
            name: {
                $regex: this.bigQ.search,
                $options: 'i'//this i is for the case insensitivity

            }
        } : {};
        this.base = this.base.find({...searchword})//adding searchword to the base
        return this;
        //we are returning all of this bigQ and base

    }

    filter(){
        //a copy the bigQ beacuse here we are using regex
        //and regex works only with strings
        //we are spreading this beacuse at the time of filtering we 
        //might have added some this earlier
        const copyQ = {...this.bigQ};
        //these are key value pairs so we use [" "]
        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        //conver object ot string
        let stringOfCopyQ = JSON.stringify(copyQ);
        
        stringOfCopyQ = stringOfCopyQ.replace(
            /\b(gte|lte|gt|lt)\b/g,
            m => `$${m}`
        );

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ);

        return this;
        
    }

    //how many page you wat to show per page
    pager(resultperPage){
        let currentPage = 1;
        //update if some page is comming in BigQ
        if(this.bigQ.page){
            currentPage = this.bigQ.page
        }
        const skipVal = resultperPage * (currentPage -1);//wellknow formula for pagination


        this.base = this.base.limit(resultperPage).skip(skipVal)

        return this;

    }
}


module.exports = WhereClause;