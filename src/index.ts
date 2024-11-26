import express, {Request, Response} from 'express';
import {rootLogger} from "ts-jest";
export const app = express();
const port = 3000;

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    NOT_FOUND_404: 404,
    BAD_REQUEST_400: 400
}

let  jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

export type videosType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: Boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: string[]
}

type dbType = {
    videos: videosType[]
}

let db: dbType = {
    videos: [{
        id: 0,
        title: "Some title",
        author: "Some author",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: "2024-11-20T12:15:53.572Z",
        publicationDate: "2024-11-20T12:15:53.572Z",
        availableResolutions: [
            "P144"
        ]
    }, {
        id: 1,
        title: "Some title-1",
        author: "Some author-1",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: "2024-11-20T12:15:53.572Z",
        publicationDate: "2024-11-20T12:15:53.572Z",
        availableResolutions: [
            "P144"
        ]
    }]
}

let errorBodyGenerator = (missingFields: string[], req: Request) => {
    let missedFields = missingFields.filter(field => !(field in req.body))
    return missedFields.map(missingField => {
        return {
            "message": "Missing important field",
            "field": missingField
        }
    })
}

app.get("/hometasks_01/api/videos", (req, res) => {
    res.status(HTTP_STATUSES.OK_200).json(db.videos);
    return;
})

app.post("/hometasks_01/api/videos", (req, res) => {
    if(req.body.title && req.body.author && req.body.availableResolutions){
        let newVideo = {
            id: db.videos.length + 1,
            title: req.body.title,
            author: req.body.author,
            availableResolutions: req.body.availableResolutions,
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: req.body.createdAt || new Date().toISOString(),
            publicationDate: req.body.publicationDate || new Date().toISOString(),
        };

        db.videos.push(newVideo);
        res.status(HTTP_STATUSES.CREATED_201).json(newVideo);
        return;
    } else {
        const missingFields = ["title","author", "availableResolutions"];
        let errors = errorBodyGenerator(missingFields, req)
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({errorsMessages: errors})
        return;
    }
})

app.get("/hometasks_01/api/videos/:id", (req: Request<{ id: string }>, res: Response) => {
    let foundVideo = db.videos.find(video => video.id === +req.params.id);

    if (foundVideo) {
        res.status(HTTP_STATUSES.OK_200).json(foundVideo);
        return
    }

    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return
}
);

app.put("/hometasks_01/api/videos/:id", (req: Request<{ id: string }>, res: Response) => {
    let foundVideo = db.videos.find(video => video.id === +req.params.id);

    if (foundVideo == null) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return
    }

    if(
        req.body.title &&
        req.body.author &&
        req.body.availableResolutions &&
        req.body.canBeDownloaded &&
        req.body.minAgeRestriction &&
        req.body.publicationDate
    ){
        db.videos = db.videos.map( video => {
            if(video.id === +req.params.id) {
                video = {
                    ...video,
                    title : req.body.title,
                    author : req.body.author,
                    availableResolutions : req.body.availableResolutions,
                    canBeDownloaded : req.body.canBeDownloaded,
                    minAgeRestriction : req.body.minAgeRestriction,
                    publicationDate: req.body.publicationDate
                }
            }
            return video;
        })
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        return;
    } else {
        let missingFields = ["title", "author", "availableResolutions", "canBeDownloaded", "minAgeRestriction", "publicationDate"];
        let errors = errorBodyGenerator(missingFields, req);
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({errorsMessages: errors});
        return;
    }

});

app.delete("/hometasks_01/api/videos/:id", (req, res) => {
    let foundVideo = db.videos.find(video => video.id === +req.params.id);

    if (foundVideo == null) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return
    } else {
        db.videos = db.videos.filter( video => video.id !== +req.params.id);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
})

app.delete("/delete-data", (req, res) => {
    db.videos = [];
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    return;
})

let server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
