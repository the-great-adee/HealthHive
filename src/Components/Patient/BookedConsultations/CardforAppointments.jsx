import React from "react";

export default function TableCard(props) {
  return (
    <>
      <tr class="border-b hover:bg-gray-100">
        <td class="whitespace-nowrap px-6 py-4 font-medium ">{props.sr}</td>
        <td class="whitespace-nowrap px-6 py-4 font-normal">{props.name}</td>
        <td class="whitespace-nowrap px-6 py-4 font-normal">{props.specialisation}</td>
        <td class="whitespace-nowrap px-6 py-4 font-normal">{props.clinic}</td>
        <td class="whitespace-nowrap px-6 py-4 font-normal">{props.location}</td>
        <td class="whitespace-nowrap px-6 py-4 font-normal">{props.date}</td>
        <td class="whitespace-nowrap px-6 py-4 font-normal">{props.time}</td>
      </tr>
    </>
  );
}
