import {describe} from "node:test";
import request from "supertest";
import {app, HTTP_STATUSES, videosType} from "../../src";

describe("videos", () => {
    beforeAll( async () => {
        await request(app).delete("/delete-data")
    })

    it("should return all videos", async () => {
       await request(app)
            .get("/hometasks_01/api/videos")
            .expect(200, [])
    })
    let data = {
        title: "Created by jest",
        author: "string",
        availableResolutions: [
            "P144"
        ]
    }

    it("should create some video", async () => {
        let response = await request(app)
            .post("/hometasks_01/api/videos")
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        expect(response.status).toBe(201); // HTTP_STATUSES.CREATED_201
        expect(response.body).toHaveProperty("id");
        expect(response.body.title).toBe(data.title);
        expect(response.body.author).toBe(data.author);
        expect(response.body.availableResolutions).toEqual(
            data.availableResolutions
        );
        expect(response.body).toHaveProperty("createdAt");
        expect(response.body).toHaveProperty("publicationDate");
    })

    it("should find a video by id", async () => {
        let response = await request(app)
            .get("/hometasks_01/api/videos/1")
            .expect(HTTP_STATUSES.OK_200)

        expect(response.body.id).toBe(1);
    })

    it("should update video by id", async () => {
        let updatedVideo = {
            title: "Updated video",
            author: "Updated author",
            availableResolutions: [],
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: "2024-11-20T12:15:53.572Z",
        };

        await request(app)
            .put("/hometasks_01/api/videos/1")
            .send(updatedVideo)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const response = await request(app)
            .get("/hometasks_01/api/videos/1")
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body.title).toBe(updatedVideo.title);
        expect(response.body.author).toBe(updatedVideo.author);
        expect(response.body.availableResolutions).toEqual(
            updatedVideo.availableResolutions
        );
        expect(response.body.canBeDownloaded).toBe(updatedVideo.canBeDownloaded);
        expect(response.body.minAgeRestriction).toBe(updatedVideo.minAgeRestriction);
        expect(response.body.publicationDate).toBe(updatedVideo.publicationDate);
    }, 10000);

    it("should delete a video by ID and return 204", async () => {
        const newVideo = {
            title: "Test Video",
            author: "Test Author",
            availableResolutions: ["P144"],
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2024-11-20T12:15:53.572Z",
            publicationDate: "2024-11-20T12:15:53.572Z",
        };

        const createResponse = await request(app)
            .post("/hometasks_01/api/videos")
            .send(newVideo)
            .expect(201);

        expect(createResponse.body).toMatchObject(newVideo);

        await request(app)
            .delete(`/hometasks_01/api/videos/${createResponse.body.id}`)
            .expect(204);

        const getResponse = await request(app)
            .get(`/hometasks_01/api/videos/${createResponse.body.id}`)
            .expect(404);

        expect(getResponse.body).toEqual({});
    });

    it("should return 404 if the video does not exist", async () => {
        const nonExistentId = 999;

        const response = await request(app)
            .delete(`/hometasks_01/api/videos/${nonExistentId}`)
            .expect(404);

        expect(response.body).toEqual({});
    });


})
