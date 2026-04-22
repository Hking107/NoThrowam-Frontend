import { Client } from "@gradio/client";

const response_0 = await fetch("https://res.cloudinary.com/du2jd7oiy/image/upload/v1776258895/uploads/aba0audunyvcmkbeoeea.jpg");
const exampleImage = await response_0.blob();

const client = await Client.connect("JeffreyYAJ/trash-detection");
const result = await client.predict("/predict", {
		image: exampleImage,
});

console.log(result.data);
