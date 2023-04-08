import { Injectable } from "@nestjs/common";

@Injectable()
export class ResponseHandler {
    success(res, data, message) {
        return res.status(200).json({ message, data });
    }

    errorInternal(error, res) {
        return res.status(500).json({ message: "Oops! Error Occured", error });
    }

    badValues(res, message) {
        return res.status(400).json({ message });
    }

    error(res, status, message, data = null) {
        return res.status(status).json({ message, data });
    }

    noAccess(res, message) {
        return res.status(203).json({ message });
    }

    successInvalid(res, message) {
        return res.status(202).json({ message });
    }

    successEmpty(res, data, message) {
        return res.status(202).json({ message, data });
    }

    message(res, status, message) {
        return res.status(status).json({ message });
    }

    forbiddenError(res, message) {
        return res.status(403).json({ message });
    }

    notAuthorized(res, message) {
        if (!message) {
            return res.status(405).json({ message: "You're not authorized" });
        }
        return res.status(405).json({ message });
    }

    notFound(res, message) {
        return res.status(404).json({ message });
    }

    signout(res) {
        return res
            .status(401)
            .json({ message: "Session Expired. Please Log in again" });
    }

    render(res, location, data) {
        return res.render(location, data);
    }

    badValuesData(res, data) {
        if (process.env.mode !== "production") {
            return this.badValues(res, data);
        }
        return res
            .status(300)
            .json({ message: "These are the missing or empty fields", data });
    }

    downloadFile(res, fileName) {
        res.download(fileName);
    }
}